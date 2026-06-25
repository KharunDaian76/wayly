import { z } from 'zod';

import { countryCodeSchema } from './schemas';

const optionalCitySchema = z.string().trim().min(1).max(120).optional();

/** GET /marketplace/active-waylers query parameters. */
export const activeWaylerMarketplaceQuerySchema = z.object({
  country: countryCodeSchema.optional(),
  city: optionalCitySchema,
  fromCountry: countryCodeSchema.optional(),
  fromCity: optionalCitySchema,
  toCountry: countryCodeSchema.optional(),
  toCity: optionalCitySchema,
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ActiveWaylerMarketplaceQueryInput = z.infer<typeof activeWaylerMarketplaceQuerySchema>;
