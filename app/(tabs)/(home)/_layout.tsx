import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeLayout() {
  const { t } = useTranslation('home');
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('title'), headerShown: false }} />
    </Stack>
  );
}
