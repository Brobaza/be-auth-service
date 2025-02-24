import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays } from 'date-fns';
import { CacheDomain } from 'src/domains/cache.domain';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { RedisKey } from 'src/enums/redis-key.enums';
import { SessionType } from 'src/enums/session-type.enum';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from 'src/jwt/jwt.constraints';
import { BaseService } from 'src/libs/base/base.service';
import { Session } from 'src/models/interfaces/session.entity';
import { ITokenPayload } from 'src/models/requests/token-payload.interface';
import { currentTime } from 'src/utils/helper';
import { Repository } from 'typeorm';
import { v7 } from 'uuid';

@Injectable()
export class SessionsService extends BaseService<Session> {
  logger = new Logger(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly cacheDomain: CacheDomain,
  ) {
    super(sessionRepo);
  }

  async generate(userId: string) {
    const sessionId = v7();

    const payload = { id: sessionId };

    const accessTokenExpiresIn = this.configService.get<number>(
      'jwt.accessTokenExpiresIn',
    );
    const refreshTokenExpiresIn = this.configService.get<number>(
      'jwt.refreshTokenExpiresIn',
    );

    const accessToken = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: ACCESS_TOKEN_PRIVATE_KEY,
      expiresIn: `${accessTokenExpiresIn}d`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: REFRESH_TOKEN_PRIVATE_KEY,
      expiresIn: `${refreshTokenExpiresIn}d`,
    });

    const refreshExpiresAt = addDays(currentTime(), accessTokenExpiresIn);
    const accessExpiresAt = addDays(currentTime(), refreshTokenExpiresIn);

    const promises = [
      this.sessionRepo.save(
        this.sessionRepo.create({
          id: sessionId,
          userId,
          expiresAt: accessExpiresAt,
        }),
      ),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${RedisKey.ACCESS_SESSIONS}:sessionId-${sessionId}`,
          userId,
          accessTokenExpiresIn * 24 * 60 * 60 * 1000,
        ),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${RedisKey.REFRESH_SESSIONS}:sessionId-${sessionId}`,
          userId,
          refreshTokenExpiresIn * 24 * 60 * 60 * 1000,
        ),
      this.cacheDomain
        .getRedisClient()
        .sadd(`${RedisKey.SESSIONS}:userId-${userId}`, sessionId),
    ];

    await Promise.all(promises);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async delete({
    userId,
    sessionId,
    accessToken,
    refreshToken,
  }: {
    userId: string;
    sessionId: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    const promises = [
      this.cacheDomain
        .getCacheManager()
        .del(`${RedisKey.ACCESS_SESSIONS}:sessionId-${sessionId}`),
      this.cacheDomain
        .getCacheManager()
        .del(`${RedisKey.REFRESH_SESSIONS}:sessionId-${sessionId}`),
      this.cacheDomain
        .getRedisClient()
        .srem(`${RedisKey.SESSIONS}:userId-${userId}`, sessionId),
      this.cacheDomain
        .getRedisClient()
        .sadd(RedisKey.BLACK_LIST_SESSIONS, sessionId),
      this.sessionRepo.softDelete({ id: sessionId }),
    ];

    if (accessToken) {
      promises.push(
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_ACCESS_TOKENS, accessToken),
      );
    }

    if (refreshToken) {
      promises.push(
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_REFRESH_TOKENS, refreshToken),
      );
    }

    await Promise.all(promises);
  }

  async verifySessionId(id: string, type: SessionType) {
    const isBlackList = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.BLACK_LIST_SESSIONS, id);

    if (isBlackList) {
      throw new UnauthorizedException({
        code: ErrorDictionary.UNAUTHORIZED,
      });
    }

    const sessionKeyPrefix =
      type === SessionType.ACCESS
        ? RedisKey.ACCESS_SESSIONS
        : RedisKey.REFRESH_SESSIONS;

    const userId = await this.cacheDomain
      .getCacheManager()
      .get<string>(`${sessionKeyPrefix}:sessionId-${id}`);

    if (!userId) {
      const session = await this.sessionRepo.findOne({
        where: { id },
      });

      if (!session) {
        await this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_SESSIONS, id);
        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      if (session.isExpired()) {
        await Promise.all([
          session.softRemove(),
          this.cacheDomain
            .getRedisClient()
            .sadd(RedisKey.BLACK_LIST_SESSIONS, id),
          this.cacheDomain
            .getCacheManager()
            .del(`${sessionKeyPrefix}:sessionId-${id}`),
        ]);

        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      await this.cacheDomain
        .getCacheManager()
        .set(
          `${sessionKeyPrefix}:sessionId-${id}`,
          session.userId,
          session.expiresAt.getTime() - Date.now(),
        );

      return { sessionId: session.id, userId: session.userId };
    }

    return { sessionId: id, userId };
  }

  async verifyToken(token: string, type: SessionType) {
    const blackListKey =
      type === SessionType.ACCESS
        ? RedisKey.BLACK_LIST_ACCESS_TOKENS
        : RedisKey.BLACK_LIST_REFRESH_TOKENS;

    try {
      const publicKey =
        type === SessionType.ACCESS
          ? ACCESS_TOKEN_PUBLIC_KEY
          : REFRESH_TOKEN_PUBLIC_KEY;

      const existingBlackList = await this.cacheDomain
        .getRedisClient()
        .sismember(blackListKey, token);

      if (existingBlackList) {
        throw new UnauthorizedException({
          code: ErrorDictionary.UNAUTHORIZED,
        });
      }

      const { id }: ITokenPayload = await this.jwtService.verifyAsync(token, {
        publicKey,
        ignoreExpiration: false,
      });

      const result = await this.verifySessionId(id, type);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await this.cacheDomain.getRedisClient().sadd(blackListKey, token);
      throw new UnauthorizedException({
        code: ErrorDictionary.UNAUTHORIZED,
      });
    }
  }
}
