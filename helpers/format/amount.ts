// Amounts are kept as bigint in the asset's smallest unit (10^-decimals). Never floats:
// 0.1 + 0.2 !== 0.3, and 18-decimal values do not fit in a double.

const AMOUNT_RE = /^(0|[1-9]\d*)(\.\d+)?$/;
// Server strings may carry a sign (activity amounts are signed).
const SIGNED_RE = /^-?(0|[1-9]\d*)(\.\d+)?$/;

/** Parses user input. Returns null if it breaks the API format or has more than `decimals` places. */
export function parseAmount(input: string, decimals: number): bigint | null {
  if (!AMOUNT_RE.test(input)) return null;
  const [whole, fraction = ''] = input.split('.');
  if (fraction.length > decimals) return null;
  return BigInt(whole + fraction.padEnd(decimals, '0'));
}

/** Parses a decimal string from the API, keeping its own scale (used for prices). */
export function parseDecimal(value: string): { units: bigint; scale: number } {
  if (!SIGNED_RE.test(value)) throw new Error(`Invalid decimal: ${value}`);
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace('-', '').split('.');
  const units = BigInt(whole + fraction);
  return { units: negative ? -units : units, scale: fraction.length };
}

/** Parses an API amount string into units of `decimals`. */
export function toUnits(value: string, decimals: number): bigint {
  const { units, scale } = parseDecimal(value);
  if (scale > decimals) throw new Error(`${value} has more than ${decimals} decimals`);
  return units * 10n ** BigInt(decimals - scale);
}

/** Formats units back to the API format: no trailing zeros, no exponent. */
export function formatAmount(units: bigint, decimals: number): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const base = 10n ** BigInt(decimals);
  const whole = (abs / base).toString();
  const fraction = (abs % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}

export type ClaimAmountError =
  | 'required'
  | 'format'
  | 'tooManyDecimals'
  | 'belowMin'
  | 'aboveAvailable'
  | 'notAboveFee';

export type ClaimRules = {
  decimals: number;
  available: bigint;
  minAmount: bigint;
  fee: bigint;
};

export function validateClaimAmount(input: string, rules: ClaimRules): ClaimAmountError | null {
  const value = input.trim();
  if (!value) return 'required';
  if (!AMOUNT_RE.test(value)) return 'format';
  const amount = parseAmount(value, rules.decimals);
  if (amount === null) return 'tooManyDecimals';
  if (amount < rules.minAmount) return 'belowMin';
  if (amount > rules.available) return 'aboveAvailable';
  // The fee is taken from the amount, so anything at or below it would receive nothing.
  if (amount <= rules.fee) return 'notAboveFee';
  return null;
}

export function receiveAmount(amount: bigint, fee: bigint): bigint {
  return amount - fee;
}

/** USD value in cents, rounded half up once at the end. */
export function usdCents(units: bigint, decimals: number, usdPrice: string): bigint {
  const price = parseDecimal(usdPrice);
  const numerator = units * price.units * 100n;
  const denominator = 10n ** BigInt(decimals + price.scale);
  return (numerator * 2n + denominator) / (denominator * 2n);
}

export function formatUsd(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const dollars = new Intl.NumberFormat('en-US').format(abs / 100n);
  const rest = (abs % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}$${dollars}.${rest}`;
}
