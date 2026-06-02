import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AppConfigService } from '../../config/config.service';

/**
 * Shared Redis client.
 *
 * Configured to be reusable as-is by future infrastructure:
 *  - `maxRetriesPerRequest: null` is required by BullMQ (queues) and works for
 *    the Socket.IO Redis adapter (horizontal WebSocket scaling).
 * Future cache/session/queue/presence concerns build on top of `getClient()`.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(
    private readonly config: AppConfigService,
    @InjectPinoLogger(RedisService.name)
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit(): void {
    this.client = new Redis(this.config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => this.logger.info('Redis connected'));
    this.client.on('error', (err) => this.logger.error({ err: err.message }, 'Redis error'));
  }

  /** Raw client for future cache/session/queue/pubsub usage. */
  getClient(): Redis {
    return this.client;
  }

  /** Returns true if Redis responds to PING. Used by the readiness probe. */
  async ping(): Promise<boolean> {
    const result = await this.client.ping();
    return result === 'PONG';
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }
}
