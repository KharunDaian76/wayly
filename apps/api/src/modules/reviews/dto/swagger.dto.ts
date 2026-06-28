import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewPartyRole } from '@wayly/types';

export class ReviewSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  reviewerId!: string;

  @ApiProperty()
  revieweeId!: string;

  @ApiProperty({ enum: ReviewPartyRole })
  reviewerRole!: ReviewPartyRole;

  @ApiProperty({ enum: ReviewPartyRole })
  revieweeRole!: ReviewPartyRole;

  @ApiProperty()
  rating!: number;

  @ApiPropertyOptional({ nullable: true })
  comment!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class UserReviewSummaryDto {
  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  averageRating!: number | null;

  @ApiProperty()
  reviewCount!: number;

  @ApiProperty()
  visibleReviewCount!: number;

  @ApiProperty()
  ratingBreakdown!: Record<string, number>;

  @ApiProperty({ type: [String] })
  recentTags!: string[];
}

export class ReviewListResponseDto {
  @ApiProperty({ type: [ReviewSummaryDto] })
  items!: ReviewSummaryDto[];

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}

export class OrderReviewMineResponseDto {
  @ApiProperty()
  hasReviewed!: boolean;

  @ApiPropertyOptional({ type: ReviewSummaryDto, nullable: true })
  review!: ReviewSummaryDto | null;
}

export class CreateReviewBodyDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  rating!: number;

  @ApiPropertyOptional()
  comment?: string;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];
}

export class AdminReviewQueueItemDto extends ReviewSummaryDto {
  @ApiProperty()
  isHidden!: boolean;

  @ApiPropertyOptional({ nullable: true })
  hiddenAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  hiddenById!: string | null;

  @ApiPropertyOptional({ nullable: true })
  adminNote!: string | null;
}

export class AdminReviewListResponseDto {
  @ApiProperty({ type: [AdminReviewQueueItemDto] })
  items!: AdminReviewQueueItemDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}

export class AdminModerateReviewBodyDto {
  @ApiProperty()
  isHidden!: boolean;

  @ApiPropertyOptional()
  adminNote?: string;
}
