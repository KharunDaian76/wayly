import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { KycStatus, UserRole } from '@wayly/types';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { RequestUser } from '../../../common/types/request-user.type';
import { AppConfigService } from '../../../config/config.service';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: AppConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles as UserRole[],
      verified: user.verified,
      kycStatus: user.kycStatus as KycStatus,
      phoneVerified: user.phoneVerified,
    };
  }
}
