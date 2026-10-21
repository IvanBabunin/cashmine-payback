import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

// Таб із рівнями всередині: один Stack веде всі вкладені екрани.
export default function HomeLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('home.title') }} />
      <Stack.Screen name="details/[id]" options={{ title: t('details.title') }} />
    </Stack>
  );
}
