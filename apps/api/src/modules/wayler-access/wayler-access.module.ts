import { Module } from '@nestjs/common';

import { WaylerAccessController } from './wayler-access.controller';
import { WaylerAccessService } from './wayler-access.service';

@Module({
  controllers: [WaylerAccessController],
  providers: [WaylerAccessService],
  exports: [WaylerAccessService],
})
export class WaylerAccessModule {}
