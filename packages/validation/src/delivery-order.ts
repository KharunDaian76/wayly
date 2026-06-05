import { DeliveryOrderStatus, DeliveryOrderType, PackageSize } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import {
  countryCodeSchema,
  currencySchema,
  nonEmptyStringSchema,
  paginationSchema,
} from './schemas';

const optionalCitySchema = z.string().trim().min(1).max(120).optional();
const optionalAddressSchema = z.string().trim().min(1).max(500).optional();
const optionalNotesSchema = z.string().trim().min(1).max(2000).optional();
const optionalDescriptionSchema = z.string().trim().min(1).max(5000).optional();
const optionalLatSchema = z.number().min(-90).max(90).optional();
const optionalLngSchema = z.number().min(-180).max(180).optional();
const optionalWeightSchema = z.coerce.number().positive().max(99_999.99).optional();
const optionalRewardSchema = z.coerce.number().nonnegative().max(99_999_999.99).optional();
const optionalDateSchema = z.string().datetime().optional();

const deliveryOrderFieldsSchema = z.object({
  type: enumSchema(DeliveryOrderType),
  title: nonEmptyStringSchema.max(200),
  description: optionalDescriptionSchema,
  packageSize: enumSchema(PackageSize).optional(),
  packageWeightKg: optionalWeightSchema,
  pickupCountry: countryCodeSchema.optional(),
  pickupCity: optionalCitySchema,
  pickupAddressText: optionalAddressSchema,
  pickupLat: optionalLatSchema,
  pickupLng: optionalLngSchema,
  dropoffCountry: countryCodeSchema.optional(),
  dropoffCity: optionalCitySchema,
  dropoffAddressText: optionalAddressSchema,
  dropoffLat: optionalLatSchema,
  dropoffLng: optionalLngSchema,
  pickupDateFrom: optionalDateSchema,
  pickupDateTo: optionalDateSchema,
  deliveryDeadline: optionalDateSchema,
  currency: currencySchema.optional(),
  offeredRewardAmount: optionalRewardSchema,
  escrowRequired: z.boolean().optional(),
  notes: optionalNotesSchema,
});

/** Create a delivery request (API not implemented yet). */
export const createDeliveryOrderSchema = deliveryOrderFieldsSchema;
export type CreateDeliveryOrderInput = z.infer<typeof createDeliveryOrderSchema>;

/** Update an existing delivery request (API not implemented yet). */
export const updateDeliveryOrderSchema = deliveryOrderFieldsSchema.partial();
export type UpdateDeliveryOrderInput = z.infer<typeof updateDeliveryOrderSchema>;

/** List/filter delivery requests (API not implemented yet). */
export const deliveryOrderQuerySchema = paginationSchema.extend({
  status: enumSchema(DeliveryOrderStatus).optional(),
  type: enumSchema(DeliveryOrderType).optional(),
  pickupCountry: countryCodeSchema.optional(),
  pickupCity: optionalCitySchema,
  dropoffCountry: countryCodeSchema.optional(),
  dropoffCity: optionalCitySchema,
});
export type DeliveryOrderQueryInput = z.infer<typeof deliveryOrderQuerySchema>;

const optionalProofNoteSchema = z.string().trim().min(1).max(1000).optional();
const optionalProofConfirmationCodeSchema = z.string().trim().min(1).max(64).optional();

/** Submit proof-of-delivery metadata (accepted Wayler, in transit or delivered). */
export const submitDeliveryProofSchema = z
  .object({
    note: optionalProofNoteSchema,
    confirmationCode: optionalProofConfirmationCodeSchema,
  })
  .refine((data) => data.note !== undefined || data.confirmationCode !== undefined, {
    message: 'At least one of note or confirmationCode is required',
  });

export type SubmitDeliveryProofInput = z.infer<typeof submitDeliveryProofSchema>;
