const DISCORD_EPOCH = 1420070400000n;

export function dateToSnowflake(date: Date): string {
  return ((BigInt(date.getTime()) - DISCORD_EPOCH) << 22n).toString();
}

export function isSnowflake(value: string): boolean {
  return /^\d{17,20}$/.test(value);
}

export function resolveSnowflakeOrDate(value: string): string {
  if (isSnowflake(value)) return value;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid snowflake or date: ${value}`);
  }
  return dateToSnowflake(date);
}
