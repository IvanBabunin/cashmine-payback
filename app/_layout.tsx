import { Stack } from 'expo-router';

import { AppFrame } from '@/components/shared/layout';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <AppFrame>
        <Stack screenOptions={{ headerShown: false }} />
      </AppFrame>
    </AppProviders>
  );
}
