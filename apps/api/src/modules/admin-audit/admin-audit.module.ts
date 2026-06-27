import { Module } from '@nestjs/common';
import { getLoggerToken, PinoLogger } from 'nestjs-pino';

import { AdminAuditLogController } from './admin-audit.controller';
import { AdminAuditLogService } from './admin-audit.service';

@Module({
  controllers: [AdminAuditLogController],
  providers: [
    AdminAuditLogService,
    {
      provide: getLoggerToken(AdminAuditLogService.name),
      useFactory: (logger: PinoLogger) => {
        logger.setContext(AdminAuditLogService.name);
        return logger;
      },
      inject: [PinoLogger],
    },
  ],
  exports: [AdminAuditLogService],
})
export class AdminAuditModule {}
