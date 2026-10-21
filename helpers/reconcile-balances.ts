import { toUnits, usdCents } from '@/helpers/format/amount';
import type { BalancesResponse } from '@/types/models/balance';
import type { ClaimStatus } from '@/types/models/claim';

export type LocalClaim = {
  asset: string;
  amount: string;
  createdAt: string;
  /** null while the claim's status has not loaded yet. */
  status: ClaimStatus | null;
};

export type DisplayBalance = {
  asset: string;
  decimals: number;
  available: bigint;
  pending: bigint;
  claiming: bigint;
  usdCents: bigint;
  /** True when local claims newer than the snapshot were applied on top of it. */
  adjusted: boolean;
};

/**
 * Balances are 15s snapshots, so a claim we just created may not be in them yet.
 * A claim moves money only if the snapshot predates it (`asOf < createdAt`, both server clocks).
 * Once a snapshot is newer than the claim the server already counts it, so we stop adjusting.
 * The balance therefore drops once and never jumps back because of a stale snapshot.
 */
export function reconcileBalances(
  snapshot: BalancesResponse,
  claims: LocalClaim[],
): DisplayBalance[] {
  const asOf = Date.parse(snapshot.asOf);
  return snapshot.items.map((item) => {
    let available = toUnits(item.available, item.decimals);
    let claiming = toUnits(item.claiming, item.decimals);
    const pending = toUnits(item.pending, item.decimals);
    let adjusted = false;

    for (const claim of claims) {
      if (claim.asset !== item.asset || Date.parse(claim.createdAt) <= asOf) continue;
      if (claim.status === 'failed') continue;
      const amount = toUnits(claim.amount, item.decimals);
      available -= amount;
      if (claim.status !== 'completed') claiming += amount;
      adjusted = true;
    }
    if (available < 0n) available = 0n;

    return {
      asset: item.asset,
      decimals: item.decimals,
      available,
      pending,
      claiming,
      usdCents: usdCents(available + pending + claiming, item.decimals, item.usdPrice),
      adjusted,
    };
  });
}

export function totalUsdCents(balances: DisplayBalance[]): bigint {
  return balances.reduce((sum, b) => sum + b.usdCents, 0n);
}
