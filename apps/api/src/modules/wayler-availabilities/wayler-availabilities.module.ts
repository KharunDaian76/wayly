import { Module } from '@nestjs/common';

import { WaylerAvailabilitiesController } from './wayler-availabilities.controller';
import { WaylerAvailabilitiesService } from './wayler-availabilities.service';

@Module({
  controllers: [WaylerAvailabilitiesController],
  providers: [WaylerAvailabilitiesService],
  exports: [WaylerAvailabilitiesService],
})
export class WaylerAvailabilitiesModule {}
