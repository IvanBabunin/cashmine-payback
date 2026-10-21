import { useQuery } from '@tanstack/react-query';

import { getBalances } from '@/api/balances';
import { queryKeys } from '@/helpers/api/query-keys';

// The server recomputes snapshots every 15s; polling faster would only return the same asOf.
const SNAPSHOT_MS = 15_000;
// Ask just after the next snapshot is due instead of 15s after our last fetch, which could
// otherwise stack two intervals of delay. Clamped because asOf is the server's clock, not ours.
const AFTER_SNAPSHOT_MS = 1_000;
const MIN_REFRESH_MS = 2_000;

export function useBalances() {
  return useQuery({
    queryKey: queryKeys.balances.all(),
    queryFn: getBalances,
    refetchInterval: (query) => {
      const asOf = query.state.data ? Date.parse(query.state.data.asOf) : NaN;
      if (Number.isNaN(asOf)) return SNAPSHOT_MS;
      const untilNext = asOf + SNAPSHOT_MS + AFTER_SNAPSHOT_MS - Date.now();
      return Math.min(SNAPSHOT_MS, Math.max(MIN_REFRESH_MS, untilNext));
    },
  });
}
