import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getClaim } from '@/api/claims';
import { queryKeys } from '@/helpers/api/query-keys';

const POLL_MS = 2_000;

export function useClaim(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.claims.detail(id),
    queryFn: () => getClaim(id),
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? POLL_MS : false),
  });

  const status = query.data?.status;
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity.all() });
    }
  }, [status, queryClient]);

  return query;
}
