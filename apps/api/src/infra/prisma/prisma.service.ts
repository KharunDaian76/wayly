import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

/**
 * Prisma client wrapper: owns the DB connection lifecycle and exposes a
 * lightweight health probe used by the readiness check. Domain models are added
 * from M1; this service does not change as the schema grows.
 */
@Injectable()
export class PrismaService
  extends PrismaClient<{
    log: [{ emit: 'event'; level: 'warn' }, { emit: 'event'; level: 'error' }];
  }>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.$on('warn', (event) => this.logger.warn({ target: event.target }, event.message));
    this.$on('error', (event) => this.logger.error({ target: event.target }, event.message));
    await this.$connect();
    this.logger.info('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Throws if the database is unreachable. Used by the readiness probe. */
  async isHealthy(): Promise<boolean> {
    await this.$queryRaw`SELECT 1`;
    return true;
  }
}
