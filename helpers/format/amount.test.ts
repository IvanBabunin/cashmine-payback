import {
  formatAmount,
  formatUsd,
  parseAmount,
  receiveAmount,
  toUnits,
  usdCents,
  validateClaimAmount,
  type ClaimRules,
} from './amount';

describe('parseAmount', () => {
  it('parses whole and fractional amounts into units', () => {
    expect(parseAmount('12', 6)).toBe(12_000_000n);
    expect(parseAmount('0.5', 6)).toBe(500_000n);
    expect(parseAmount('0.000001', 6)).toBe(1n);
  });

  it('keeps precision beyond what a double can hold', () => {
    expect(parseAmount('123456789.123456789123456789', 18)).toBe(123456789123456789123456789n);
  });

  it.each(['', '.5', '1.', '05', '1e-3', '-1', '1,5', ' 1', '0x10', '1.2.3'])(
    'rejects %p',
    (input) => {
      expect(parseAmount(input, 6)).toBeNull();
    },
  );

  it('rejects more decimals than the asset allows', () => {
    expect(parseAmount('0.0000001', 6)).toBeNull();
    expect(parseAmount('0.1', 0)).toBeNull();
  });
});

describe('formatAmount / toUnits', () => {
  it('round-trips without trailing zeros', () => {
    expect(formatAmount(toUnits('820.413207', 6), 6)).toBe('820.413207');
    expect(formatAmount(toUnits('50.10', 6), 6)).toBe('50.1');
    expect(formatAmount(0n, 8)).toBe('0');
    expect(formatAmount(-981n, 2)).toBe('-9.81');
  });

  it('avoids float drift', () => {
    expect(formatAmount(toUnits('0.1', 8) + toUnits('0.2', 8), 8)).toBe('0.3');
  });
});

describe('validateClaimAmount', () => {
  const rules: ClaimRules = {
    decimals: 8,
    available: toUnits('1.5', 8),
    minAmount: toUnits('0.01', 8),
    fee: toUnits('0.0012', 8),
  };

  it('accepts amounts within the rules, including exactly min and exactly available', () => {
    expect(validateClaimAmount('0.5', rules)).toBeNull();
    expect(validateClaimAmount('0.01', rules)).toBeNull();
    expect(validateClaimAmount('1.5', rules)).toBeNull();
  });

  it('reports the first broken rule', () => {
    expect(validateClaimAmount('', rules)).toBe('required');
    expect(validateClaimAmount('.5', rules)).toBe('format');
    expect(validateClaimAmount('0.123456789', rules)).toBe('tooManyDecimals');
    expect(validateClaimAmount('0.009', rules)).toBe('belowMin');
    expect(validateClaimAmount('1.50000001', rules)).toBe('aboveAvailable');
  });

  it('rejects amounts that would receive nothing after the fee', () => {
    expect(validateClaimAmount('0.0012', { ...rules, minAmount: 0n })).toBe('notAboveFee');
  });
});

describe('fee and totals', () => {
  it('subtracts the fee from the claimed amount', () => {
    expect(formatAmount(receiveAmount(toUnits('0.5', 18), toUnits('0.0012', 18)), 18)).toBe('0.4988');
  });

  it('computes USD in cents with half-up rounding', () => {
    expect(usdCents(toUnits('820.413207', 6), 6, '1.0002')).toBe(82058n);
    expect(usdCents(toUnits('0.005', 6), 6, '1')).toBe(1n);
    expect(usdCents(toUnits('0.004', 6), 6, '1')).toBe(0n);
  });

  it('formats USD with grouping', () => {
    expect(formatUsd(123456789n)).toBe('$1,234,567.89');
    expect(formatUsd(5n)).toBe('$0.05');
  });
});
