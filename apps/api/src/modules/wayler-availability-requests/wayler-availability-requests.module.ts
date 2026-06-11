import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';

import { WaylerAvailabilityRequestsController } from './wayler-availability-requests.controller';
import { WaylerAvailabilityRequestsService } from './wayler-availability-requests.service';

@Module({
  imports: [NotificationsModule],
  controllers: [WaylerAvailabilityRequestsController],
  providers: [WaylerAvailabilityRequestsService],
})
export class WaylerAvailabilityRequestsModule {}
