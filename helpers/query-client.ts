import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/helpers/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // 4xx won't fix itself on retry, except 429 which tells us how long to wait.
      retry: (failureCount, error) =>
        failureCount < 3 &&
        !(isApiError(error) && error.isClientError && error.code !== 'RATE_LIMITED'),
      retryDelay: (attempt, error) =>
        isApiError(error) && error.retryAfterMs
          ? error.retryAfterMs
          : Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});
