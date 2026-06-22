import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { WaylerAccessModule } from '../wayler-access/wayler-access.module';

import { AdminOrdersController } from './admin-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [NotificationsModule, WaylerAccessModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
