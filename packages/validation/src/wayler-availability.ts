import { TripDirection, WaylerAvailabilityStatus, WaylerAvailabilityType } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { countryCodeSchema } from './schemas';

const optionalCitySchema = z.string().trim().min(1).max(120).optional();
const optionalRegionSchema = z.string().trim().min(1).max(120).optional();
const optionalDateTimeSchema = z.string().datetime().optional();
const optionalWeightSchema = z.coerce.number().positive().max(99_999.99).optional();
const optionalNotesSchema = z.string().trim().max(1000).optional();

const optionalIsoDateQuerySchema = z
  .string()
  .trim()
  .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || !Number.isNaN(Date.parse(val)), {
    message: 'Invalid ISO date or date-time',
  })
  .optional();

/** POST /wayler-availabilities body. */
export const createWaylerAvailabilitySchema = z
  .object({
    type: enumSchema(WaylerAvailabilityType),
    originCountry: countryCodeSchema.optional(),
    originCity: optionalCitySchema,
    originRegion: optionalRegionSchema,
    destinationCountry: countryCodeSchema.optional(),
    destinationCity: optionalCitySchema,
    destinationRegion: optionalRegionSchema,
    availableFrom: optionalDateTimeSchema,
    availableTo: optionalDateTimeSchema,
    departureDate: optionalDateTimeSchema,
    returnDate: optionalDateTimeSchema,
    tripDirection: enumSchema(TripDirection).optional(),
    maxPackages: z.coerce.number().int().positive().optional(),
    maxWeightKg: optionalWeightSchema,
    notes: optionalNotesSchema,
  })
  .superRefine((data, ctx) => {
    if (data.availableTo && data.availableFrom) {
      if (new Date(data.availableTo) < new Date(data.availableFrom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'availableTo must be >= availableFrom',
          path: ['availableTo'],
        });
      }
    }

    if (data.returnDate && data.departureDate) {
      if (new Date(data.returnDate) < new Date(data.departureDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'returnDate must be >= departureDate',
          path: ['returnDate'],
        });
      }
    }

    if (data.type === WaylerAvailabilityType.LOCAL_AVAILABILITY) {
      if (!data.originCountry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'originCountry is required for LOCAL_AVAILABILITY',
          path: ['originCountry'],
        });
      }
      if (!data.originCity && !data.originRegion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'originCity or originRegion is required for LOCAL_AVAILABILITY',
          path: ['originCity'],
        });
      }
      if (!data.availableFrom) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'availableFrom is required for LOCAL_AVAILABILITY',
          path: ['availableFrom'],
        });
      }
    }

    if (data.type === WaylerAvailabilityType.TRIP_ROUTE) {
      if (!data.originCountry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'originCountry is required for TRIP_ROUTE',
          path: ['originCountry'],
        });
      }
      if (!data.originCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'originCity is required for TRIP_ROUTE',
          path: ['originCity'],
        });
      }
      if (!data.destinationCountry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'destinationCountry is required for TRIP_ROUTE',
          path: ['destinationCountry'],
        });
      }
      if (!data.destinationCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'destinationCity is required for TRIP_ROUTE',
          path: ['destinationCity'],
        });
      }
      if (!data.departureDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'departureDate is required for TRIP_ROUTE',
          path: ['departureDate'],
        });
      }
      if (!data.tripDirection) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'tripDirection is required for TRIP_ROUTE',
          path: ['tripDirection'],
        });
      }
      if (data.tripDirection === TripDirection.RETURN && !data.returnDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'returnDate is required when tripDirection is RETURN',
          path: ['returnDate'],
        });
      }
    }
  });

export type CreateWaylerAvailabilityInput = z.infer<typeof createWaylerAvailabilitySchema>;

/** GET /wayler-availabilities/mine query parameters. */
export const waylerAvailabilitiesMineQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(WaylerAvailabilityStatus).optional(),
  type: enumSchema(WaylerAvailabilityType).optional(),
});

export type WaylerAvailabilitiesMineQueryInput = z.infer<
  typeof waylerAvailabilitiesMineQuerySchema
>;

/** GET /wayler-availabilities/public query parameters. */
export const waylerAvailabilitiesPublicQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: enumSchema(WaylerAvailabilityType).optional(),
  originCountry: countryCodeSchema.optional(),
  originCity: optionalCitySchema,
  originRegion: optionalRegionSchema,
  destinationCountry: countryCodeSchema.optional(),
  destinationCity: optionalCitySchema,
  destinationRegion: optionalRegionSchema,
  date: optionalIsoDateQuerySchema,
});

export type WaylerAvailabilitiesPublicQueryInput = z.infer<
  typeof waylerAvailabilitiesPublicQuerySchema
>;

/** GET /wayler-availabilities/active-counts query parameters. */
export const activeWaylerCountsQuerySchema = z.object({
  country: countryCodeSchema.optional(),
  city: optionalCitySchema,
  region: optionalRegionSchema,
  date: optionalIsoDateQuerySchema,
});

export type ActiveWaylerCountsQueryInput = z.infer<typeof activeWaylerCountsQuerySchema>;
