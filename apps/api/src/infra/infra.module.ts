import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

/**
 * Infrastructure foundation. Marked @Global so every current and future module
 * can inject `PrismaService` / `RedisService` without re-importing.
 *
 * Holds infrastructure only — no business logic. Queues (BullMQ), the Socket.IO
 * Redis adapter, and object storage will be added here in their milestones.
 */
@Global()
@Module({
  imports: [PrismaModule, RedisModule],
  exports: [PrismaModule, RedisModule],
})
export class InfraModule {}
