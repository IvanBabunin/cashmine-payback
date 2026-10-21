import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from '@/components/shared/ui';
import { formatUsd } from '@/helpers/format/amount';
import { makeStyles, useTheme } from '@/theme';

type TotalHeaderProps = {
  totalCents: bigint;
  asOf: string;
  now: number;
  refreshing: boolean;
  refreshFailed: boolean;
  onRefresh: () => void;
};

export function TotalHeader({
  totalCents,
  asOf,
  now,
  refreshing,
  refreshFailed,
  onRefresh,
}: TotalHeaderProps) {
  const { t } = useTranslation(['home', 'common']);
  const styles = useStyles();
  const theme = useTheme();

  // asOf is server time; clamp so a slightly fast server clock never shows "in the future".
  const seconds = Math.max(0, Math.round((now - Date.parse(asOf)) / 1000));
  const ago =
    seconds < 60
      ? t('ago.seconds', { count: seconds })
      : t('ago.minutes', { count: Math.floor(seconds / 60) });

  return (
    <View style={styles.root}>
      <Text variant="label" color="textMuted">
        {t('total')}
      </Text>
      <Text variant="title" selectable tabular>
        {formatUsd(totalCents)}
      </Text>
      <View style={styles.row}>
        <Text variant="caption" color={refreshFailed ? 'warning' : 'textMuted'} style={styles.flex}>
          {refreshFailed
            ? t('stale', { ago })
            : seconds < 5
              ? t('updatedJustNow')
              : t('updated', { ago })}
        </Text>
        {refreshing ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common:actions.refresh')}
            onPress={onRefresh}
            hitSlop={12}
          >
            <MaterialDesignIcons name="refresh" size={20} color={theme.colors.accent} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, minHeight: 24 },
  flex: { flex: 1 },
}));
