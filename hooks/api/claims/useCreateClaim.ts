import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createClaim } from '@/api/claims';
import { isApiError } from '@/helpers/api/errors';
import { queryKeys } from '@/helpers/api/query-keys';
import { useClaimsStore } from '@/store/claims';
import type { CreateClaimBody } from '@/types/models/claim';

export type CreateClaimVariables = { key: string; body: CreateClaimBody };

export const CREATE_CLAIM_KEY = ['claims', 'create'] as const;

const MAX_RETRIES = 2;

/**
 * Submits a claim with an Idempotency-Key. The key and body are saved before the request, so when
 * the outcome is unknown (timeout, 5xx, no network) the same request can be repeated later, even
 * after a reload, and the server returns the original claim instead of creating a second one.
 */
export function useCreateClaim() {
  const queryClient = useQueryClient();
  const { start, confirm, remove } = useClaimsStore.getState();

  return useMutation({
    mutationKey: CREATE_CLAIM_KEY,
    mutationFn: ({ key, body }: CreateClaimVariables) => {
      if (!useClaimsStore.getState().submissions[key]) start(key, body);
      return createClaim(body, key);
    },
    // Retrying is safe only because the key and body stay the same.
    retry: (count, error) =>
      count < MAX_RETRIES &&
      isApiError(error) &&
      (error.isOutcomeUnknown || error.code === 'RATE_LIMITED'),
    retryDelay: (attempt, error) =>
      isApiError(error) && error.retryAfterMs ? error.retryAfterMs : 1500 * (attempt + 1),
    onSuccess: (claim, { key }) => {
      confirm(key, claim.id, claim.createdAt);
      queryClient.setQueryData(queryKeys.claims.detail(claim.id), claim);
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity.all() });
    },
    onError: (error, { key }) => {
      // A 4xx means the server rejected the claim, so nothing was created.
      if (isApiError(error) && !error.isOutcomeUnknown) remove(key);
    },
  });
}
