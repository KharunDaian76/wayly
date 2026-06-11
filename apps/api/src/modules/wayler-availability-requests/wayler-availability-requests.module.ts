import { Module } from '@nestjs/common';

import { WaylerAvailabilityRequestsController } from './wayler-availability-requests.controller';
import { WaylerAvailabilityRequestsService } from './wayler-availability-requests.service';

@Module({
  controllers: [WaylerAvailabilityRequestsController],
  providers: [WaylerAvailabilityRequestsService],
})
export class WaylerAvailabilityRequestsModule {}
