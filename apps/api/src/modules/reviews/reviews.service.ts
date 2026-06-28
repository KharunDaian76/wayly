import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DeliveryOrder } from '@prisma/client';
import { DeliveryOrderStatus as PrismaDeliveryOrderStatus } from '@prisma/client';
import type {
  AdminReviewListResponse,
  AdminReviewQueueItem,
  OrderReviewMineResponse,
  ReviewListResponse,
  ReviewSummary,
  UserReviewSummary,
} from '@wayly/types';
import { NotificationEntityType, NotificationType, ReviewPartyRole, UserRole } from '@wayly/types';
import type {
  AdminModerateReviewInput,
  AdminReviewsListQueryInput,
  CreateReviewInput,
  ReviewsListForUserQueryInput,
} from '@wayly/validation';

import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { appLinkHref } from '../notifications/notification.helpers';

import { emptyRatingBreakdown, toAdminReviewQueueItem, toReviewSummary } from './reviews.mapper';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createForOrder(
    user: RequestUser,
    orderId: string,
    body: CreateReviewInput,
  ): Promise<ReviewSummary> {
    const order = await this.findOrderForReviewOrThrow(orderId);
    this.assertDelivered(order);
    const { revieweeId, reviewerRole, revieweeRole } = this.resolveReviewParties(order, user.id);

    if (revieweeId === user.id) {
      throw new BadRequestException('You cannot review yourself');
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        orderId_reviewerId_revieweeId: {
          orderId,
          reviewerId: user.id,
          revieweeId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this delivery for this party');
    }

    const review = await this.prisma.review.create({
      data: {
        orderId,
        reviewerId: user.id,
        revieweeId,
        reviewerRole,
        revieweeRole,
        rating: body.rating,
        comment: body.comment?.trim() || null,
        tags: body.tags ?? [],
      },
    });

    await this.notifications.createForUser({
      userId: revieweeId,
      type: NotificationType.INFO,
      title: 'New delivery review received',
      body: `You received a ${body.rating}-star review from a marketplace participant (user-submitted trust signal only).`,
      entityType: NotificationEntityType.SYSTEM,
      entityId: review.id,
      linkHref: appLinkHref('/app'),
    });

    return toReviewSummary(review);
  }

  async getUserSummary(userId: string): Promise<UserReviewSummary> {
    const visibleReviews = await this.prisma.review.findMany({
      where: { revieweeId: userId, isHidden: false },
      orderBy: { createdAt: 'desc' },
      select: { rating: true, tags: true },
    });

    const allCount = await this.prisma.review.count({ where: { revieweeId: userId } });
    const breakdown = emptyRatingBreakdown();
    let ratingSum = 0;

    for (const row of visibleReviews) {
      const key = String(row.rating) as keyof typeof breakdown;
      if (key in breakdown) {
        breakdown[key] += 1;
      }
      ratingSum += row.rating;
    }

    const tagCounts = new Map<string, number>();
    for (const row of visibleReviews.slice(0, 10)) {
      for (const tag of row.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const recentTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      userId,
      averageRating:
        visibleReviews.length > 0
          ? Math.round((ratingSum / visibleReviews.length) * 10) / 10
          : null,
      reviewCount: allCount,
      visibleReviewCount: visibleReviews.length,
      ratingBreakdown: breakdown,
      recentTags,
    };
  }

  async listForUser(
    userId: string,
    query: ReviewsListForUserQueryInput,
  ): Promise<ReviewListResponse> {
    const where = { revieweeId: userId, isHidden: false };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items: items.map(toReviewSummary),
      limit: query.limit,
      total,
    };
  }

  async getMineForOrder(userId: string, orderId: string): Promise<OrderReviewMineResponse> {
    const order = await this.findOrderForReviewOrThrow(orderId);
    if (!this.isOrderParticipant(order, userId)) {
      throw new NotFoundException('Delivery order not found');
    }

    const review = await this.prisma.review.findFirst({
      where: { orderId, reviewerId: userId },
    });

    return {
      hasReviewed: Boolean(review),
      review: review ? toReviewSummary(review) : null,
    };
  }

  async listForAdmin(query: AdminReviewsListQueryInput): Promise<AdminReviewListResponse> {
    const where = {
      ...(query.isHidden !== undefined ? { isHidden: query.isHidden } : {}),
      ...(query.rating !== undefined ? { rating: query.rating } : {}),
      ...(query.reviewerId ? { reviewerId: query.reviewerId } : {}),
      ...(query.revieweeId ? { revieweeId: query.revieweeId } : {}),
      ...(query.orderId ? { orderId: query.orderId } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items: items.map(toAdminReviewQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async moderateForAdmin(
    actor: RequestUser,
    reviewId: string,
    body: AdminModerateReviewInput,
  ): Promise<AdminReviewQueueItem> {
    this.assertAdmin(actor);

    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    const now = new Date();
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isHidden: body.isHidden,
        adminNote: body.adminNote?.trim() || existing.adminNote,
        hiddenAt: body.isHidden ? (existing.hiddenAt ?? now) : null,
        hiddenById: body.isHidden ? actor.id : null,
      },
    });

    if (existing.isHidden !== body.isHidden) {
      await this.notifications.createForUser({
        userId: existing.reviewerId,
        type: NotificationType.INFO,
        title: body.isHidden ? 'Your review was hidden' : 'Your review is visible again',
        body: body.isHidden
          ? 'Platform moderation hid your review for policy review (content moderation only — not a legal judgment).'
          : 'Platform moderation restored visibility of your review.',
        entityType: NotificationEntityType.SYSTEM,
        entityId: updated.id,
        linkHref: appLinkHref('/app'),
      });
    }

    return toAdminReviewQueueItem(updated);
  }

  private assertAdmin(user: RequestUser): void {
    if (!user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('ADMIN role required');
    }
  }

  private assertDelivered(order: DeliveryOrder): void {
    if (order.status !== PrismaDeliveryOrderStatus.DELIVERED) {
      throw new BadRequestException('Reviews are only allowed for delivered orders');
    }
  }

  private async findOrderForReviewOrThrow(orderId: string): Promise<DeliveryOrder> {
    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Delivery order not found');
    }
    return order;
  }

  private isOrderParticipant(order: DeliveryOrder, userId: string): boolean {
    return order.senderId === userId || order.acceptedWaylerId === userId;
  }

  private resolveReviewParties(
    order: DeliveryOrder,
    userId: string,
  ): { revieweeId: string; reviewerRole: ReviewPartyRole; revieweeRole: ReviewPartyRole } {
    if (order.senderId === userId) {
      if (!order.acceptedWaylerId) {
        throw new BadRequestException('Delivery order has no accepted Wayler');
      }
      return {
        revieweeId: order.acceptedWaylerId,
        reviewerRole: ReviewPartyRole.SENDER,
        revieweeRole: ReviewPartyRole.WAYLER,
      };
    }

    if (order.acceptedWaylerId === userId) {
      return {
        revieweeId: order.senderId,
        reviewerRole: ReviewPartyRole.WAYLER,
        revieweeRole: ReviewPartyRole.SENDER,
      };
    }

    throw new ForbiddenException('You are not a participant on this delivery order');
  }
}
