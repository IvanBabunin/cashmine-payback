import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ClaimStatusCard } from '@/components/screens/claims/ClaimStatusCard';
import { ErrorState, LoadingState, Screen } from '@/components/shared/layout';
import { Button } from '@/components/shared/ui';
import { useClaim } from '@/hooks/api/claims/useClaim';
import { errorMessageKey } from '@/helpers/api/errors';
import { ROUTES } from '@/helpers/routes';

export default function ClaimStatusScreen() {
  const { t } = useTranslation(['claims', 'common']);
  const { claimId } = useLocalSearchParams<{ claimId: string }>();
  const query = useClaim(claimId);

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t('statusTitle') }} />
      {query.data ? (
        <>
          <ClaimStatusCard claim={query.data} />
          <Button
            title={t('done')}
            variant="secondary"
            onPress={() => router.dismissTo(ROUTES.HOME)}
          />
        </>
      ) : query.isPending ? (
        <LoadingState />
      ) : (
        <ErrorState message={t(errorMessageKey(query.error))} onRetry={() => query.refetch()} />
      )}
    </Screen>
  );
}
