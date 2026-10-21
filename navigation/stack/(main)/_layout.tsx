import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

// Застосунок з рівнями: один Stack веде всі екрани.
// Окремий _layout додається лише там, де змінюється поведінка (напр. top tabs на екрані).
export default function MainLayout() {
  const { t } = useTranslation(['common', 'settings']);
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('home.title') }} />
      <Stack.Screen name="details/[id]" options={{ title: t('details.title') }} />
      <Stack.Screen name="settings/index" options={{ title: t('settings:title') }} />
    </Stack>
  );
}
