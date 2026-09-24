import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST') || process.env.REDIS_HOST || 'localhost';
    const port = parseInt(
      String(this.configService.get<number>('REDIS_PORT') || process.env.REDIS_PORT || 6379),
      10,
    );
    const password = this.configService.get<string>('REDIS_PASSWORD') || process.env.REDIS_PASSWORD || undefined;

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false, // Fail fast if Redis is down so HTTP requests are never delayed
        retryStrategy: (times) => {
          // Exponential backoff with max 30s
          return Math.min(times * 1000, 30000);
        },
      });

      this.client.on('connect', () => {
        this.logger.log(`Connecting to Redis cache at ${host}:${port}...`);
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.logger.log(`Redis cache connected and ready [${host}:${port}]`);
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          this.logger.warn(`Redis connection error: ${err?.message || err}. Falling back to PostgreSQL.`);
        }
        this.isConnected = false;
      });

      this.client.on('close', () => {
        if (this.isConnected) {
          this.logger.warn('Redis connection closed. Read queries will hit PostgreSQL.');
        }
        this.isConnected = false;
      });

      // Non-blocking asynchronous connect
      this.client.connect().catch((err) => {
        this.logger.warn(
          `Redis cache not reachable at ${host}:${port} (${err?.message || err}). Application will run in DB-only mode.`,
        );
      });
    } catch (err: any) {
      this.logger.warn(`Could not initialize Redis client: ${err?.message}. Continuing without Redis.`);
      this.client = null;
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.logger.log('Redis client disconnected cleanly.');
      } catch {
        this.client.disconnect();
      }
    }
  }

  /**
   * Checks whether the Redis cache is connected and available.
   */
  public isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Retrieves a cached value and parses it from JSON.
   * Gracefully returns null if Redis is offline or an error occurs.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady() || !this.client) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      this.logger.debug(`Redis GET failed for key "${key}": ${err?.message}`);
      return null;
    }
  }

  /**
   * Stores a value in Redis serialized as JSON with an optional TTL (in seconds).
   * Non-blocking and fail-safe.
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isReady() || !this.client) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.debug(`Redis SET failed for key "${key}": ${err?.message}`);
    }
  }

  /**
   * Deletes a specific cache key.
   */
  async del(key: string): Promise<void> {
    if (!this.isReady() || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.debug(`Redis DEL failed for key "${key}": ${err?.message}`);
    }
  }

  /**
   * Safely invalidates all keys matching a wildcard pattern (e.g. 'feed:*' or 'events:public:*').
   * Uses non-blocking SCAN instead of KEYS to avoid freezing Redis.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isReady() || !this.client) {
      return;
    }

    try {
      let cursor = '0';
      const keysToDelete: string[] = [];

      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          keysToDelete.push(...keys);
        }
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.client.del(...keysToDelete);
        this.logger.debug(`Invalidated ${keysToDelete.length} keys matching pattern: "${pattern}"`);
      }
    } catch (err: any) {
      this.logger.debug(`Redis invalidatePattern failed for "${pattern}": ${err?.message}`);
    }
  }
}
