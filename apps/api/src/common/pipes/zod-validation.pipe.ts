import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { formatZodError } from '@wayly/validation';
import type { ZodSchema } from 'zod';

/**
 * Validates request bodies against a shared @wayly/validation Zod schema.
 * Used alongside (not instead of) the global class-validator ValidationPipe.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: formatZodError(result.error),
      });
    }
    return result.data;
  }
}

/** Factory for inline @Body(new ZodValidationPipe(schema)) usage. */
export function zodBody<T extends ZodSchema>(schema: T): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}

/** Factory for inline @Query(new ZodValidationPipe(schema)) usage. */
export function zodQuery<T extends ZodSchema>(schema: T): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
