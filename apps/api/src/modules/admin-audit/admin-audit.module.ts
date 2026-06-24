import { Module } from '@nestjs/common';

import { AdminAuditLogController } from './admin-audit.controller';
import { AdminAuditLogService } from './admin-audit.service';

@Module({
  controllers: [AdminAuditLogController],
  providers: [AdminAuditLogService],
  exports: [AdminAuditLogService],
})
export class AdminAuditModule {}
