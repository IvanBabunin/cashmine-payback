import { useTranslation } from 'react-i18next';

import { SettingsItem } from '@/components/screens/settings/SettingsItem';
import { Screen } from '@/components/shared/layout';
import { useSettingsStore, type ThemeMode } from '@/store/settings';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  return (
    <Screen scroll>
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
