import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { WaylerAccessModule } from '../wayler-access/wayler-access.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [NotificationsModule, WaylerAccessModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
