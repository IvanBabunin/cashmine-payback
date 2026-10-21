import { useQuery } from '@tanstack/react-query';

import { getClaimOptions } from '@/api/claims';
import { queryKeys } from '@/helpers/api/query-keys';

export function useClaimOptions(asset: string | undefined) {
  return useQuery({
    queryKey: queryKeys.claims.options(asset ?? ''),
    queryFn: () => getClaimOptions(asset!),
    enabled: !!asset,
  });
}
