import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { BalanceCard } from '@/components/screens/home/BalanceCard';
import { TotalHeader } from '@/components/screens/home/TotalHeader';
import { UnresolvedClaimBanner } from '@/components/screens/home/UnresolvedClaimBanner';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenTitle,
} from '@/components/shared/layout';
import { Text } from '@/components/shared/ui';
import { useDisplayBalances } from '@/hooks/api/balances/useDisplayBalances';
import { useCreateClaim } from '@/hooks/api/claims/useCreateClaim';
import { useNow } from '@/hooks/ui/useNow';
import { errorMessageKey } from '@/helpers/api/errors';
import { ROUTES } from '@/helpers/routes';
import { makeStyles } from '@/theme';

export default function HomeScreen() {
  const { t } = useTranslation(['home', 'common']);
  const { query, balances, total, unresolved } = useDisplayBalances();
  const retryClaim = useCreateClaim();
  const now = useNow(5_000);
  const styles = useStyles();

  if (query.isPending) {
    return (
      <Screen edges={['top']}>
        <ScreenTitle title={t('title')} />
        <LoadingState />
      </Screen>
    );
  }
  if (!query.data || !balances || total === null) {
    return (
      <Screen edges={['top']}>
        <ScreenTitle title={t('title')} />
        <ErrorState message={t(errorMessageKey(query.error))} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={['top']}
      refreshControl={
        <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
      }
    >
      <ScreenTitle title={t('title')} />
      <TotalHeader
        totalCents={total}
        balances={balances}
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
      {balances.length > 0 ? (
        <View style={styles.section}>
          <Text variant="subtitle">{t('assets')}</Text>
          <Text variant="caption" color="textMuted">
            {t('assetCount', { count: balances.length })}
          </Text>
        </View>
      ) : null}
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

const useStyles = makeStyles((t) => ({
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: t.spacing.sm,
  },
}));
