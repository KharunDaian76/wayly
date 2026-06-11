import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';

import { WaylerAccessController } from './wayler-access.controller';
import { WaylerAccessService } from './wayler-access.service';

@Module({
  imports: [NotificationsModule],
  controllers: [WaylerAccessController],
  providers: [WaylerAccessService],
  exports: [WaylerAccessService],
})
export class WaylerAccessModule {}
