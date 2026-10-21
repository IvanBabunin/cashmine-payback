import { useQuery } from '@tanstack/react-query';

import { getBalances } from '@/api/balances';
import { queryKeys } from '@/helpers/api/query-keys';

// The server recomputes snapshots every 15s; polling faster would only return the same asOf.
export const BALANCES_REFRESH_MS = 15_000;

export function useBalances() {
  return useQuery({
    queryKey: queryKeys.balances.all(),
    queryFn: getBalances,
    refetchInterval: BALANCES_REFRESH_MS,
  });
}
