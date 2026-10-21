import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/shared/layout';
import { Text } from '@/components/shared/ui';

export default function DetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Text>{t('details.id', { id })}</Text>
    </Screen>
  );
}
