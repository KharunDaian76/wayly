import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessagePreviewDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ example: 'I can pick up after 3pm.' })
  body!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class ChatMessageSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  conversationId!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ example: 'I can pick up after 3pm.' })
  body!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  readAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class ConversationSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ format: 'uuid' })
  waylerId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: ChatMessagePreviewDto })
  lastMessage!: ChatMessagePreviewDto | null;
}

export class ConversationDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ format: 'uuid' })
  waylerId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: [ChatMessageSummaryDto] })
  messages!: ChatMessageSummaryDto[];
}

export class ConversationListResponseDto {
  @ApiProperty({ type: [ConversationSummaryDto] })
  items!: ConversationSummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  total!: number;
}

export class SendChatMessageBodyDto {
  @ApiProperty({ example: 'I can pick up after 3pm.', maxLength: 2000 })
  body!: string;
}

export class MarkConversationReadResponseDto {
  @ApiProperty({ example: 2 })
  updatedCount!: number;
}
