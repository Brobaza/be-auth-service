import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class CacheDomain {
  private redisClients: Redis;
  private redisLockClient: Redlock;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const configs = this.configService.get('redis');

    const { host, port, database, password } = configs;

    this.redisClients = new Redis({ host, port, db: database, password });

    this.redisClients.on('connect', () => console.log('Connected to Redis'));
    this.redisClients.on('error', (err) => console.error('Redis Error:', err));

    this.redisLockClient = new Redlock([this.redisClients], {
      driftFactor: this.configService.get<number>('redis_lock.drift_factor'),
      retryJitter: this.configService.get<number>('redis_lock.retry_jitter'),
    });
  }

  getRedisClient() {
    return this.redisClients;
  }

  getCacheManager() {
    return this.cacheManager;
  }

  getLockClient() {
    return this.redisLockClient;
  }

  async withLock<T>(
    keys: string[],
    ttl: number,
    fn: () => Promise<T>,
    isRetry = true,
  ): Promise<T> {
    const lockTll = (ttl || 10) * 1000;

    const lockKeys = keys.map(
      (key) => `${this.configService.get('redis.prefix')}:lock:${key}`,
    );

    let lock;
    try {
      lock = await this.redisLockClient.acquire(lockKeys, lockTll, {
        ...(isRetry
          ? {
              retryCount: this.configService.get<number>(
                'redis_lock.retry_count',
              ),
              retryDelay: this.configService.get<number>(
                'redis_lock.retry_delay',
              ),
            }
          : { retryCount: 0, retryDelay: 0 }),
      });
    } catch (error) {
      console.error(`Failed to acquire lock for ${keys}`, error);
      throw new Error(`Cannot acquire lock for ${keys}`);
    }

    const extendInterval = lockTll / 3;
    const intervalId = setInterval(async () => {
      try {
        await lock.extend(lockTll);
        console.log(`Extended lock for ${keys}`);
      } catch (error) {
        console.error(`Failed to extend lock for ${keys}`, error);
        clearInterval(intervalId);
      }
    }, extendInterval);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      console.log('e: ', err);
      throw err;
    } finally {
      clearInterval(intervalId);

      if (lock) {
        await lock
          .release()
          .catch((err) =>
            console.error(`Failed to release lock for ${keys}`, err),
          );
        console.log(`Released lock for ${keys}`);
      }
    }
  }

  withLockNoRetry<T>(keys: string[], ttl: number, fn: () => Promise<T>) {
    return this.withLock(keys, ttl, fn, false);
  }

  async createEmptySet(key: string) {
    await this.getRedisClient().sadd(key, '1');
    await this.getRedisClient().srem(key, '1');
  }
}
