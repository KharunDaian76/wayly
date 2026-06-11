import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { WaylerAccessModule } from '../wayler-access/wayler-access.module';

import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [NotificationsModule, WaylerAccessModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
