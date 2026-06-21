import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';

import { AdminDisputesController } from './admin-disputes.controller';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

@Module({
  imports: [NotificationsModule],
  controllers: [DisputesController, AdminDisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
