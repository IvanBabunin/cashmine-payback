import { useMutationState, useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getClaim } from '@/api/claims';
import { queryKeys } from '@/helpers/api/query-keys';
import { reconcileBalances, totalUsdCents, type LocalClaim } from '@/helpers/reconcile-balances';
import { CREATE_CLAIM_KEY, type CreateClaimVariables } from '@/hooks/api/claims/useCreateClaim';
import { useClaimsStore } from '@/store/claims';

import { useBalances } from './useBalances';

/** Server balances with this device's claims that the snapshot does not include yet (decision C). */
export function useDisplayBalances() {
  const query = useBalances();
  const submissions = useClaimsStore((s) => s.submissions);
  const asOf = query.data ? Date.parse(query.data.asOf) : null;

  const list = Object.values(submissions);
  const inFlight = useMutationState({
    filters: { mutationKey: CREATE_CLAIM_KEY, status: 'pending' },
    select: (m) => (m.state.variables as CreateClaimVariables | undefined)?.key,
  });
  // No claim id and no request running: we never learned whether the server created it.
  const unconfirmed = list.filter((s) => !s.claimId);
  const unresolved = unconfirmed.filter((s) => !inFlight.includes(s.key));
  const recent = list.filter(
    (s) => s.claimId && s.createdAt && asOf !== null && Date.parse(s.createdAt) > asOf,
  );

  const statuses = useQueries({
    queries: recent.map((s) => ({
      queryKey: queryKeys.claims.detail(s.claimId!),
      queryFn: () => getClaim(s.claimId!),
    })),
  });

  const statusKey = statuses.map((q) => q.data?.status ?? '').join();
  const balances = useMemo(() => {
    if (!query.data) return null;
    const local: LocalClaim[] = recent.map((s, i) => ({
      asset: s.body.asset,
      amount: s.body.amount,
      createdAt: s.createdAt!,
      status: statuses[i]?.data?.status ?? null,
    }));
    return reconcileBalances(query.data, local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, submissions, statusKey]);

  return {
    query,
    balances,
    total: balances ? totalUsdCents(balances) : null,
    unconfirmed,
    unresolved,
  };
}
