import { formatAmount } from '@/helpers/format/amount';

import { reconcileBalances, totalUsdCents, type LocalClaim } from './reconcile-balances';

const snapshot = {
  asOf: '2026-10-21T10:00:00.000Z',
  items: [
    {
      asset: 'ETH',
      decimals: 18,
      available: '1.5',
      pending: '0.1',
      claiming: '0',
      usdPrice: '2000',
    },
    { asset: 'USDT', decimals: 6, available: '10', pending: '0', claiming: '0', usdPrice: '1' },
  ],
};

const claim = (over: Partial<LocalClaim>): LocalClaim => ({
  asset: 'ETH',
  amount: '0.5',
  createdAt: '2026-10-21T10:00:05.000Z',
  status: 'pending',
  ...over,
});

const eth = (claims: LocalClaim[]) => reconcileBalances(snapshot, claims)[0];

describe('reconcileBalances', () => {
  it('returns the snapshot unchanged without local claims', () => {
    const b = eth([]);
    expect(formatAmount(b.available, 18)).toBe('1.5');
    expect(b.adjusted).toBe(false);
  });

  it('moves a claim newer than the snapshot from available to claiming', () => {
    const b = eth([claim({})]);
    expect(formatAmount(b.available, 18)).toBe('1');
    expect(formatAmount(b.claiming, 18)).toBe('0.5');
    expect(b.adjusted).toBe(true);
  });

  it('treats a claim whose status has not loaded yet as pending', () => {
    expect(formatAmount(eth([claim({ status: null })]).available, 18)).toBe('1');
  });

  it('ignores claims the snapshot already includes', () => {
    const b = eth([claim({ createdAt: '2026-10-21T09:59:59.000Z' })]);
    expect(formatAmount(b.available, 18)).toBe('1.5');
    expect(b.adjusted).toBe(false);
  });

  it('removes a completed claim from available without adding it to claiming', () => {
    const b = eth([claim({ status: 'completed' })]);
    expect(formatAmount(b.available, 18)).toBe('1');
    expect(b.claiming).toBe(0n);
  });

  it('does not subtract a failed claim, since its amount went back to available', () => {
    expect(formatAmount(eth([claim({ status: 'failed' })]).available, 18)).toBe('1.5');
  });

  it('only touches the claimed asset', () => {
    const usdt = reconcileBalances(snapshot, [claim({})])[1];
    expect(formatAmount(usdt.available, 6)).toBe('10');
  });

  it('totals USD across assets, counting available, pending and claiming', () => {
    // ETH: (1.5 + 0.1) * 2000 = 3200, USDT: 10 → 3210.00
    expect(totalUsdCents(reconcileBalances(snapshot, []))).toBe(321000n);
    // A pending claim moves value between buckets, it does not change the total.
    expect(totalUsdCents(reconcileBalances(snapshot, [claim({})]))).toBe(321000n);
  });
});
