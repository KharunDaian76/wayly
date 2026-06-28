import { Module } from '@nestjs/common';

import { AdminSupportTicketsController } from './admin-support-tickets.controller';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  controllers: [SupportTicketsController, AdminSupportTicketsController],
  providers: [SupportTicketsService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
