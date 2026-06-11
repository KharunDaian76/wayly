import { WaylerAvailabilityRequestStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { countryCodeSchema, currencySchema, idSchema } from './schemas';

const optionalDateTimeSchema = z.string().datetime().optional();
const optionalAddressSchema = z.string().trim().min(1).max(500).optional();
const optionalMessageSchema = z.string().trim().max(2000).optional();

/** POST /wayler-availability-requests body. */
export const createWaylerAvailabilityRequestSchema = z
  .object({
    availabilityId: idSchema,
    title: z.string().trim().min(1).max(200),
    packageDescription: z.string().trim().min(1).max(2000),
    pickupCountry: countryCodeSchema,
    pickupCity: z.string().trim().min(1).max(120),
    pickupAddress: optionalAddressSchema,
    dropoffCountry: countryCodeSchema,
    dropoffCity: z.string().trim().min(1).max(120),
    dropoffAddress: optionalAddressSchema,
    desiredPickupFrom: optionalDateTimeSchema,
    desiredPickupTo: optionalDateTimeSchema,
    desiredDeliveryFrom: optionalDateTimeSchema,
    desiredDeliveryTo: optionalDateTimeSchema,
    proposedRewardCents: z.coerce.number().int().positive(),
    currency: currencySchema.default('EUR'),
    message: optionalMessageSchema,
  })
  .superRefine((data, ctx) => {
    if (data.desiredPickupTo && data.desiredPickupFrom) {
      if (new Date(data.desiredPickupTo) < new Date(data.desiredPickupFrom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'desiredPickupTo must be >= desiredPickupFrom',
          path: ['desiredPickupTo'],
        });
      }
    }

    if (data.desiredDeliveryTo && data.desiredDeliveryFrom) {
      if (new Date(data.desiredDeliveryTo) < new Date(data.desiredDeliveryFrom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'desiredDeliveryTo must be >= desiredDeliveryFrom',
          path: ['desiredDeliveryTo'],
        });
      }
    }
  });

export type CreateWaylerAvailabilityRequestInput = z.infer<
  typeof createWaylerAvailabilityRequestSchema
>;

/** POST /wayler-availability-requests/:id/accept|decline optional body. */
export const respondWaylerAvailabilityRequestSchema = z
  .object({
    responseMessage: optionalMessageSchema,
  })
  .default({});

export type RespondWaylerAvailabilityRequestInput = z.infer<
  typeof respondWaylerAvailabilityRequestSchema
>;

/** GET /wayler-availability-requests/mine/* query parameters. */
export const waylerAvailabilityRequestsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(WaylerAvailabilityRequestStatus).optional(),
});

export type WaylerAvailabilityRequestsListQueryInput = z.infer<
  typeof waylerAvailabilityRequestsListQuerySchema
>;
