/** Parse a duration string like `15m`, `1h`, `30d` into milliseconds. */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = match[2] as 's' | 'm' | 'h' | 'd';
  const multipliers: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * multipliers[unit];
}

/** Compute an expiry Date from a duration string. */
export function expiresAtFromDuration(value: string): Date {
  return new Date(Date.now() + parseDurationMs(value));
}
