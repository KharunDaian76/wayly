import { Module } from '@nestjs/common';

import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { AdminPaymentsController } from './admin-payments.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [NotificationsModule, AdminAuditModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
