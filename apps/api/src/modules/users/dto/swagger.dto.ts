import { ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only schema for PATCH /users/me (validated by Zod at runtime). */
export class UpdateProfileBodyDto {
  @ApiPropertyOptional({ example: 'Alex Sender' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'en' })
  locale?: string;

  @ApiPropertyOptional({ example: 'US' })
  country?: string;

  @ApiPropertyOptional({ example: '+14155552671' })
  phone?: string;
}
