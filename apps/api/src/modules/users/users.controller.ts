import { Body, Controller, Get, NotFoundException, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { UserProfile } from '@wayly/types';
import { updateProfileSchema } from '@wayly/validation';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresActiveAccount } from '../../common/decorators/requires-active-account.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';
import { UserProfileDto } from '../auth/dto/swagger.dto';

import { UpdateProfileBodyDto } from './dto/swagger.dto';
import { toUserProfile } from './user.mapper';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  async getMe(@CurrentUser() user: RequestUser): Promise<UserProfile> {
    const record = await this.users.findById(user.id);
    if (!record) {
      throw new NotFoundException('User not found');
    }
    return toUserProfile(record);
  }

  @Patch('me')
  @RequiresActiveAccount()
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiBody({ type: UpdateProfileBodyDto })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(updateProfileSchema)) body: ReturnType<typeof updateProfileSchema.parse>,
  ): Promise<UserProfile> {
    const updated = await this.users.updateProfile(user.id, body);
    return toUserProfile(updated);
  }
}
