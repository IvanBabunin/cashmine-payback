import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Screen, ScreenTitle } from '@/components/shared/layout';
import { Button, Text } from '@/components/shared/ui';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore, type ThemeMode } from '@/store/settings';
import { makeStyles } from '@/theme';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const styles = useStyles();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);

  return (
    <Screen scroll edges={['top']}>
      <ScreenTitle title={t('title')} />

      <View style={styles.section}>
        <Text variant="label" color="textMuted">
          {t('account')}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text variant="label">{t('token')}</Text>
              <Text variant="caption" color="textMuted">
                {t('tokenHint')}
              </Text>
            </View>
            {token ? (
              <Text variant="label" color="textMuted" tabular>
                {`${token.slice(0, 6)}…${token.slice(-4)}`}
              </Text>
            ) : null}
          </View>
          <Button title={t('changeToken')} variant="secondary" onPress={clearToken} />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" color="textMuted">
          {t('appearance')}
        </Text>
        <View style={styles.card}>
          <Text variant="label">{t('themeLabel')}</Text>
          <View style={styles.segments} accessibilityRole="radiogroup">
            {THEME_MODES.map((mode) => {
              const active = mode === themeMode;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => setThemeMode(mode)}
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Text variant="label" color={active ? 'text' : 'textMuted'}>
                    {t(`themeShort.${mode}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: t.spacing.sm },
  card: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  flex: { flex: 1, gap: t.spacing.xs },
  segments: {
    flexDirection: 'row',
    padding: t.spacing.xs,
    gap: t.spacing.xs,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.field,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.sm + t.spacing.xs,
  },
  segmentActive: { backgroundColor: t.colors.surface },
}));
