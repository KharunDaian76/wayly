import type { AuthResult, UserProfile } from '@wayly/types';

/** POST /auth/register */
export interface RegisterBody {
  email: string;
  password: string;
  displayName: string;
  locale?: string;
  country?: string;
}

/** POST /auth/login */
export interface LoginBody {
  email: string;
  password: string;
}

/** PATCH /users/me */
export interface UpdateProfileBody {
  displayName?: string;
  avatarUrl?: string;
  locale?: string;
  country?: string;
  phone?: string;
}

export interface AuthApi {
  register(body: RegisterBody): Promise<AuthResult>;
  login(body: LoginBody): Promise<AuthResult>;
  /** Uses httpOnly refresh cookie; no request body. */
  refresh(): Promise<AuthResult>;
  logout(accessToken?: string | null): Promise<{ ok: true }>;
}

export interface UsersApi {
  me(accessToken?: string | null): Promise<UserProfile>;
  updateMe(body: UpdateProfileBody, accessToken?: string | null): Promise<UserProfile>;
}

export type { AuthResult, UserProfile };
