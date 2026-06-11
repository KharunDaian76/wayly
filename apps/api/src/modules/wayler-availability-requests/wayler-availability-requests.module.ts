import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { WaylerAccessModule } from '../wayler-access/wayler-access.module';

import { WaylerAvailabilityRequestsController } from './wayler-availability-requests.controller';
import { WaylerAvailabilityRequestsService } from './wayler-availability-requests.service';

@Module({
  imports: [NotificationsModule, WaylerAccessModule],
  controllers: [WaylerAvailabilityRequestsController],
  providers: [WaylerAvailabilityRequestsService],
})
export class WaylerAvailabilityRequestsModule {}
