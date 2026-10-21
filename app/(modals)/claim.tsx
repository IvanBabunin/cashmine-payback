import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssetPicker } from '@/components/screens/claims/AssetPicker';
import { ClaimForm } from '@/components/screens/claims/ClaimForm';
import { ClaimReview } from '@/components/screens/claims/ClaimReview';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/shared/layout';
import { useDisplayBalances } from '@/hooks/api/balances/useDisplayBalances';
import { useClaimOptions } from '@/hooks/api/claims/useClaimOptions';
import { useCreateClaim } from '@/hooks/api/claims/useCreateClaim';
import { errorMessageKey, isApiError } from '@/helpers/api/errors';
import { ROUTES } from '@/helpers/routes';
import type { CreateClaimBody } from '@/types/models/claim';

type Draft = { key: string; body: CreateClaimBody };

export default function ClaimScreen() {
  const { t } = useTranslation(['claims', 'common']);
  const { asset } = useLocalSearchParams<{ asset?: string }>();
  const { query: balancesQuery, balances, unresolved } = useDisplayBalances();
  const optionsQuery = useClaimOptions(asset);
  const createClaim = useCreateClaim();
  const [draft, setDraft] = useState<Draft | null>(null);

  const balance = balances?.find((b) => b.asset === asset);
  // A claim for this asset whose outcome we never learned takes over the screen until it resolves.
  const pendingUnknown = unresolved.find((s) => s.body.asset === asset);
  const active: Draft | null = pendingUnknown
    ? { key: pendingUnknown.key, body: pendingUnknown.body }
    : draft;

  const header = <Stack.Screen options={{ title: t('title') }} />;
  const error = balancesQuery.error ?? optionsQuery.error;

  if (balancesQuery.isPending || (asset && optionsQuery.isPending)) {
    return (
      <Screen>
        {header}
        <LoadingState />
      </Screen>
    );
  }
  if (!balances || !optionsQuery.data) {
    return (
      <Screen>
        {header}
        {error ? (
          <ErrorState
            message={t(errorMessageKey(error))}
            onRetry={() => {
              void balancesQuery.refetch();
              void optionsQuery.refetch();
            }}
          />
        ) : (
          <EmptyState title={t('common:notFound.title')} />
        )}
      </Screen>
    );
  }
  if (!balance) {
    return (
      <Screen>
        {header}
        <EmptyState title={t('common:notFound.title')} />
      </Screen>
    );
  }

  const submit = (d: Draft) =>
    createClaim.mutate(d, {
      onSuccess: (claim) => router.replace(ROUTES.CLAIM_STATUS(claim.id)),
    });

  const mutationError = createClaim.error;
  const unknown = !!pendingUnknown || (isApiError(mutationError) && mutationError.isOutcomeUnknown);

  return (
    <Screen scroll>
      {header}
      <AssetPicker
        assets={balances.map((b) => b.asset)}
        selected={balance.asset}
        disabled={!!active}
        onSelect={(next) => router.setParams({ asset: next })}
      />
      {active ? (
        <ClaimReview
          body={active.body}
          decimals={balance.decimals}
          options={optionsQuery.data}
          submitting={createClaim.isPending}
          unknown={unknown}
          rejectedMessage={!unknown && mutationError ? mutationError.message : undefined}
          onConfirm={() => submit(active)}
          onBack={() => {
            createClaim.reset();
            setDraft(null);
          }}
        />
      ) : (
        <ClaimForm
          key={balance.asset}
          asset={balance.asset}
          decimals={balance.decimals}
          available={balance.available}
          options={optionsQuery.data}
          onReview={(body) => setDraft({ key: crypto.randomUUID(), body })}
        />
      )}
    </Screen>
  );
}
