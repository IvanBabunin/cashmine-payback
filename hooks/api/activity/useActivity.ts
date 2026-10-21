import { useInfiniteQuery } from '@tanstack/react-query';

import { getActivity } from '@/api/activity';
import { queryKeys } from '@/helpers/api/query-keys';

export function useActivity() {
  return useInfiniteQuery({
    queryKey: queryKeys.activity.all(),
    queryFn: ({ pageParam }) => getActivity(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });
}
