import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';

import { AppFrame } from '@/components/shared/layout';
import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/store/auth';

export default function RootLayout() {
  // Not blocking on load: text renders in the fallback face and swaps in when Inter arrives.
  useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return (
    <AppProviders>
      <AppFrame>
        <RootStack />
      </AppFrame>
    </AppProviders>
  );
}

function RootStack() {
  const hasToken = useAuthStore((s) => !!s.token);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasToken}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)/claim"
          options={{ presentation: 'modal', headerShown: true }}
        />
        <Stack.Screen name="claims/[claimId]" options={{ headerShown: true }} />
      </Stack.Protected>
      <Stack.Protected guard={!hasToken}>
        <Stack.Screen name="token" />
      </Stack.Protected>
    </Stack>
  );
}
