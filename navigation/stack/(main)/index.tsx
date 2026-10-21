import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmptyState, Screen } from '@/components/shared/layout';
import { Button } from '@/components/shared/ui';
import { ROUTES } from '@/helpers/routes';

export default function HomeScreen() {
  const { t } = useTranslation(['common', 'settings']);
  const router = useRouter();
  return (
    <Screen>
      <EmptyState
        title={t('home.empty')}
        action={
          <>
            <Button
              title={t('home.openDetails')}
              variant="secondary"
              onPress={() => router.push(ROUTES.DETAILS('1'))}
            />
            <Button
              title={t('settings:title')}
              variant="ghost"
              onPress={() => router.push(ROUTES.SETTINGS)}
            />
          </>
        }
      />
    </Screen>
  );
}
