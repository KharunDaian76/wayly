import { z } from 'zod';

import {
  countryCodeSchema,
  emailSchema,
  localeSchema,
  nonEmptyStringSchema,
  passwordSchema,
  phoneE164Schema,
} from './schemas';

/**
 * Auth & user-profile schemas (shared by backend validation and frontend forms).
 * Order/payment/chat/KYC schemas are intentionally NOT here yet.
 */

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nonEmptyStringSchema.max(80),
  locale: localeSchema.optional(),
  country: countryCodeSchema.optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  // Deliberately not the full password policy — never reveal rules on login.
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Refresh uses the httpOnly cookie; no request body is required. */
export const refreshSchema = z.object({}).strict();
export type RefreshInput = z.infer<typeof refreshSchema>;

export const updateProfileSchema = z
  .object({
    displayName: nonEmptyStringSchema.max(80).optional(),
    avatarUrl: z.string().url().optional(),
    locale: localeSchema.optional(),
    country: countryCodeSchema.optional(),
    phone: phoneE164Schema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  token: nonEmptyStringSchema,
  password: passwordSchema,
});
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
