import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';

import { AdminReviewsController } from './admin-reviews.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
