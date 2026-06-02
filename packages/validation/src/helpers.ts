import { z } from 'zod';

/** Re-export a single zod instance so consumers don't pull divergent versions. */
export { z };

/**
 * Build a Zod enum from a `@wayly/types` const-object's VALUES, e.g.
 * `enumSchema(OrderStatus)`. Keeps validation in lockstep with the shared enums
 * without redeclaring the members.
 */
export function enumSchema<T extends Record<string, string>>(obj: T) {
  const values = Object.values(obj) as [T[keyof T], ...T[keyof T][]];
  return z.enum(values);
}

/** Parse-or-throw with the original ZodError preserved. */
export function validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/** Non-throwing parse returning a typed result. */
export function safeValidate<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  return schema.safeParse(data);
}

/** Flatten a ZodError into `field -> messages` for forms/error envelopes. */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (result[key] ??= []).push(issue.message);
  }
  return result;
}
