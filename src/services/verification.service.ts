import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { addSeconds } from 'date-fns';
import { CacheDomain } from 'src/domains/cache.domain';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { RedisKey } from 'src/enums/redis-key.enums';
import { VerificationType } from 'src/enums/verifycation.type';
import { BaseService } from 'src/libs/base/base.service';
import { Verification } from 'src/models/interfaces/verification.entity';
import { currentTime } from 'src/utils/helper';
import { random } from 'src/utils/random';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationService extends BaseService<Verification> {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    private readonly configService: ConfigService,
    private readonly cacheDomain: CacheDomain,
  ) {
    super(verificationRepo);
  }

  async generate(userId: string, type: VerificationType, credential: string) {
    let expiresIn = 0;
    let limitKey = '';

    switch (type) {
      case VerificationType.EMAIL_REGISTER:
        expiresIn = this.configService.get<number>(
          'verification.register.expires_in',
        );
        limitKey = RedisKey.LIMIT_EMAIL_REGISTER_VERIFICATIONS;
        break;

      case VerificationType.EMAIL_RESET_PASSWORD:
        expiresIn = this.configService.get<number>(
          'verification.reset_password.expires_in',
        );
        limitKey = RedisKey.LIMIT_EMAIL_RESET_PASSWORD_VERIFICATIONS;
        break;

      default:
        throw new UnprocessableEntityException({
          code: ErrorDictionary.UNSUPPORTED_VERIFICATION_TYPE,
        });
    }

    const existing = await this.cacheDomain
      .getCacheManager()
      .get(`${limitKey}:userId-${userId}`);
    if (existing) {
      throw new UnprocessableEntityException({
        code: ErrorDictionary.TO_MANY_VERIFICATION_REQUEST,
      });
    }

    const code = this.configService.get<boolean>(
      'verification.enable_default_code',
    )
      ? '123456'
      : random.stringNumber(
          this.configService.get<number>('verification.length.code'),
        );

    const token = random.string(
      this.configService.get<number>('verification.length.token'),
    );

    const expiresAt = addSeconds(currentTime(), expiresIn);

    const { id } = await this.verificationRepo.save(
      this.verificationRepo.create({
        code,
        token,
        expiresAt,
        type,
        userId,
        credential,
      }),
    );

    const promises = [
      this.cacheDomain
        .getCacheManager()
        .set(`${RedisKey.VERIFICATION_TIMEOUT}:${id}`, true, expiresIn * 1000),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${RedisKey.VERIFICATIONS}:token-${token}:code-${code}`,
          id,
          expiresIn * 1000,
        ),
      this.cacheDomain
        .getCacheManager()
        .set(
          `${limitKey}:userId-${userId}`,
          true,
          this.configService.get<number>('verification.limit_time') * 1000,
        ),
    ];

    await Promise.all(promises);

    // this.queueDomain.sendVerificationEvent(id, userId);

    return { id, code, token, expiresAt };
  }

  async verify(token: string, code: string): Promise<Verification | null> {
    const cacheValue = `token-${token}:code-${code}`;

    const existingBlackList = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue);

    if (existingBlackList) return null;

    const key = `${RedisKey.VERIFICATIONS}:${cacheValue}`;
    const verificationId = await this.cacheDomain
      .getCacheManager()
      .get<string>(key);

    if (!verificationId) {
      const verification = await this.verificationRepo.findOne({
        where: { token, code },
        relations: ['user'],
      });

      if (!verification) {
        await this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue);
        return null;
      }

      if (verification.usedAt) {
        await Promise.all([
          this.cacheDomain
            .getRedisClient()
            .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue),
          verification.softRemove(),
        ]);

        return null;
      }

      if (verification.isExpired()) {
        await Promise.all([
          this.cacheDomain
            .getRedisClient()
            .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue),
          verification.softRemove(),
        ]);

        return null;
      }

      await this.cacheDomain
        .getCacheManager()
        .set(
          key,
          verification.id,
          verification.expiresAt.getTime() - Date.now(),
        );

      return verification;
    }

    const verification = await this.verificationRepo.findOne({
      where: { id: verificationId },
      relations: ['user'],
    });

    if (!verification) {
      await Promise.all([
        this.cacheDomain.getCacheManager().del(key),
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue),
      ]);

      return null;
    }

    if (verification.usedAt) {
      const promises = [
        this.cacheDomain.getCacheManager().del(key),
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue),
        verification.softRemove(),
      ];
      await Promise.all(promises);

      return null;
    }

    if (verification.isExpired()) {
      await Promise.all([
        this.cacheDomain.getCacheManager().del(key),
        this.cacheDomain
          .getRedisClient()
          .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, cacheValue),
        verification.softRemove(),
      ]);

      return null;
    }

    return verification;
  }

  async setUsed({ id, code, token }: Verification) {
    await Promise.all([
      this.verificationRepo.update(id, {
        usedAt: currentTime(),
        deletedAt: currentTime(),
      }),
      this.cacheDomain
        .getRedisClient()
        .sadd(RedisKey.BLACK_LIST_VERIFICATIONS, `token-${token}:code-${code}`),
    ]);
  }

  findById(id: string) {
    return this.verificationRepo.findOneBy({ id });
  }
}
