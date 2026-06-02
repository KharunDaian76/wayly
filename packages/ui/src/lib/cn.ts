import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Single source of truth for class merging across the whole product.
 * Resolves Tailwind conflicts (last-wins) so component `className` overrides work.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
