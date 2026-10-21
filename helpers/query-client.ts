import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/helpers/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx не повторюємо: повтор не виправить неправильний запит.
      retry: (failureCount, error) =>
        !(isApiError(error) && error.isClientError) && failureCount < 2,
    },
  },
});
