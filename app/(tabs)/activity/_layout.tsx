import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ActivityLayout() {
  const { t } = useTranslation('activity');
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('title') }} />
    </Stack>
  );
}
