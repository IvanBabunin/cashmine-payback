import { useMutationState, useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { getClaim } from '@/api/claims';
import { queryKeys } from '@/helpers/api/query-keys';
import { reconcileBalances, totalUsdCents, type LocalClaim } from '@/helpers/reconcile-balances';
import { CREATE_CLAIM_KEY, type CreateClaimVariables } from '@/hooks/api/claims/useCreateClaim';
import { useClaimsStore } from '@/store/claims';

import { useBalances } from './useBalances';

const CLAIM_POLL_MS = 3_000;

/** Server balances with this device's claims that the snapshot does not include yet (decision C). */
export function useDisplayBalances() {
  const query = useBalances();
  const queryClient = useQueryClient();
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
  const confirmed = list.filter((s) => s.claimId && s.createdAt);
  const recent = confirmed.filter((s) => asOf !== null && Date.parse(s.createdAt!) > asOf);

  // Follow this device's claims from Home too, not only on the status screen, so a claim that
  // settles while the user is here refreshes the balances right away.
  const statuses = useQueries({
    queries: confirmed.map((s) => ({
      queryKey: queryKeys.claims.detail(s.claimId!),
      queryFn: () => getClaim(s.claimId!),
      refetchInterval: (q: { state: { data?: { status: string } } }) =>
        q.state.data && q.state.data.status !== 'pending' ? false : CLAIM_POLL_MS,
    })),
  });
  const statusById = new Map(confirmed.map((s, i) => [s.claimId!, statuses[i]?.data?.status]));

  const statusKey = statuses.map((q) => q.data?.status ?? '').join();
  const settledCount = statuses.filter((q) => q.data && q.data.status !== 'pending').length;
  useEffect(() => {
    if (settledCount > 0) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances.all() });
    }
  }, [settledCount, queryClient]);
  const balances = useMemo(() => {
    if (!query.data) return null;
    const local: LocalClaim[] = recent.map((s) => ({
      asset: s.body.asset,
      amount: s.body.amount,
      createdAt: s.createdAt!,
      status: statusById.get(s.claimId!) ?? null,
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
