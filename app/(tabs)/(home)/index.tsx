import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native';

import { BalanceCard } from '@/components/screens/home/BalanceCard';
import { TotalHeader } from '@/components/screens/home/TotalHeader';
import { UnresolvedClaimBanner } from '@/components/screens/home/UnresolvedClaimBanner';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/shared/layout';
import { useDisplayBalances } from '@/hooks/api/balances/useDisplayBalances';
import { useCreateClaim } from '@/hooks/api/claims/useCreateClaim';
import { useNow } from '@/hooks/ui/useNow';
import { errorMessageKey } from '@/helpers/api/errors';
import { ROUTES } from '@/helpers/routes';

export default function HomeScreen() {
  const { t } = useTranslation(['home', 'common']);
  const { query, balances, total, unresolved } = useDisplayBalances();
  const retryClaim = useCreateClaim();
  const now = useNow(5_000);

  if (query.isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (!query.data || !balances || total === null) {
    return (
      <Screen>
        <ErrorState message={t(errorMessageKey(query.error))} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
      }
    >
      <TotalHeader
        totalCents={total}
        asOf={query.data.asOf}
        now={now}
        refreshing={query.isFetching}
        refreshFailed={query.isRefetchError}
        onRefresh={() => query.refetch()}
      />
      {unresolved.map((s) => (
        <UnresolvedClaimBanner
          key={s.key}
          amount={s.body.amount}
          asset={s.body.asset}
          checking={retryClaim.isPending && retryClaim.variables?.key === s.key}
          onCheck={() =>
            retryClaim.mutate(
              { key: s.key, body: s.body },
              { onSuccess: (claim) => router.push(ROUTES.CLAIM_STATUS(claim.id)) },
            )
          }
        />
      ))}
      {balances.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyDescription')} />
      ) : (
        balances.map((b) => (
          <BalanceCard
            key={b.asset}
            balance={b}
            onClaim={() => router.push(ROUTES.CLAIM(b.asset))}
          />
        ))
      )}
    </Screen>
  );
}
