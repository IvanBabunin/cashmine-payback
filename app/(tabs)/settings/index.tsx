import { useTranslation } from 'react-i18next';

import { SettingsItem } from '@/components/screens/settings/SettingsItem';
import { Screen } from '@/components/shared/layout';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore, type ThemeMode } from '@/store/settings';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);

  return (
    <Screen scroll>
      <SettingsItem
        title={t('changeToken')}
        value={token ? `${token.slice(0, 8)}…` : undefined}
        onPress={clearToken}
      />
      {THEME_MODES.map((mode) => (
        <SettingsItem
          key={mode}
          title={t(`theme.${mode}`)}
          value={mode === themeMode ? '✓' : undefined}
          onPress={() => setThemeMode(mode)}
        />
      ))}
    </Screen>
  );
}
