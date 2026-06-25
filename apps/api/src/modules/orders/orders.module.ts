import { Module } from '@nestjs/common';

import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WaylerAccessModule } from '../wayler-access/wayler-access.module';

import { AdminOrdersController } from './admin-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [NotificationsModule, WaylerAccessModule, AdminAuditModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
