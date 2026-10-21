import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from '@/components/shared/ui';
import { formatUsd } from '@/helpers/format/amount';
import type { DisplayBalance } from '@/helpers/reconcile-balances';
import { assetColors, makeStyles, useTheme } from '@/theme';

type TotalHeaderProps = {
  totalCents: bigint;
  balances: DisplayBalance[];
  asOf: string;
  now: number;
  refreshing: boolean;
  refreshFailed: boolean;
  onRefresh: () => void;
};

export function TotalHeader({
  totalCents,
  balances,
  asOf,
  now,
  refreshing,
  refreshFailed,
  onRefresh,
}: TotalHeaderProps) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const theme = useTheme();

  // asOf is server time; clamp so a slightly fast server clock never shows "in the future".
  const seconds = Math.max(0, Math.round((now - Date.parse(asOf)) / 1000));
  const ago =
    seconds < 60
      ? t('ago.seconds', { count: seconds })
      : t('ago.minutes', { count: Math.floor(seconds / 60) });
  const [dollars, cents] = formatUsd(totalCents).split('.');
  // Share of the total is display-only, so Number() precision is fine here.
  const shares = balances.filter((b) => b.usdCents > 0n);

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Text variant="label" color="textMuted">
          {t('total')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('refresh')}
          onPress={onRefresh}
          disabled={refreshing}
          hitSlop={8}
          style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <MaterialDesignIcons name="refresh" size={16} color={theme.colors.accent} />
          )}
          <Text variant="caption" color={refreshFailed ? 'warning' : 'textMuted'}>
            {refreshFailed
              ? t('stale', { ago })
              : seconds < 5
                ? t('updatedJustNow')
                : t('updated', { ago })}
          </Text>
        </Pressable>
      </View>
      <Text variant="display" tabular selectable>
        {dollars}
        <Text variant="subtitle" color="textMuted" tabular>
          .{cents}
        </Text>
      </Text>
      {totalCents > 0n ? (
        <>
          <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no">
            {shares.map((b) => (
              <View
                key={b.asset}
                style={[
                  styles.segment,
                  {
                    flex: Number(b.usdCents),
                    backgroundColor: assetColors[b.asset] ?? theme.colors.textMuted,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.legend}>
            {shares.map((b) => (
              <View key={b.asset} style={styles.legendItem}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: assetColors[b.asset] ?? theme.colors.textMuted },
                  ]}
                />
                <Text variant="caption" color="textMuted" tabular>
                  {b.asset} {Math.round((Number(b.usdCents) / Number(totalCents)) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    gap: t.spacing.sm,
    padding: t.spacing.xl - t.spacing.xs,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refresh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    minHeight: 32,
    paddingHorizontal: t.spacing.sm,
    marginRight: -t.spacing.sm,
    borderRadius: t.radius.sm,
  },
  pressed: { opacity: 0.7 },
  bar: { flexDirection: 'row', height: 6, gap: 3, marginTop: t.spacing.md },
  segment: { minWidth: 6, borderRadius: t.radius.full },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs + 2 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
}));
