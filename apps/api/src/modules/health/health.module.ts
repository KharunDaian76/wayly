import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { AdminSystemHealthController } from './admin-system-health.controller';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { SystemHealthService } from './system-health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController, AdminSystemHealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator, SystemHealthService],
})
export class HealthModule {}
