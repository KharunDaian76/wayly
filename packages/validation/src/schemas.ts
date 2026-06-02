import { z } from 'zod';

/**
 * Reusable, framework-agnostic Zod primitives (NOT business DTOs).
 *
 * Shared by backend DTO validation and frontend form validation so the same
 * rules apply on both sides. Order/payment/KYC DTOs compose THESE later.
 */

/** UUID identifier. */
export const idSchema = z.string().uuid();

export const emailSchema = z.string().trim().toLowerCase().email();

/** E.164 phone format (e.g. +14155552671) — used by OTP verification. */
export const phoneE164Schema = z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone number');

/** Reasonable password policy baseline. */
export const passwordSchema = z
  .string()
  .min(8, 'Must be at least 8 characters')
  .max(128, 'Must be at most 128 characters');

export const nonEmptyStringSchema = z.string().trim().min(1);

/** ISO-4217 currency code (3 uppercase letters). */
export const currencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'Invalid ISO-4217 currency code');

/** Money as integer minor units (cents) + currency. Never floats. */
export const moneySchema = z.object({
  amountCents: z.number().int().nonnegative(),
  currency: currencySchema,
});

/** WGS84 geographic point. */
export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/** ISO 3166-1 alpha-2 country code. */
export const countryCodeSchema = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, 'Invalid ISO 3166-1 alpha-2 country code');

export const localeSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid locale');

/** Cursor-based pagination query primitives (used by feeds/lists). */
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
