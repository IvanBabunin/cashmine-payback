import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setAuthToken, setUnauthorizedHandler } from '@/helpers/api/client';
import { queryClient } from '@/helpers/query-client';
import { i18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { useClaimsStore } from '@/store/claims';

import { ThemeProvider } from './ThemeProvider';

setAuthToken(useAuthStore.getState().token);
useAuthStore.subscribe((state, prev) => {
  if (state.token === prev.token) return;
  setAuthToken(state.token);
  // Data and pending claims belong to one token; never show them under another.
  queryClient.clear();
  useClaimsStore.getState().reset();
});
setUnauthorizedHandler(() => useAuthStore.getState().rejectToken());

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>{children}</ThemeProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
