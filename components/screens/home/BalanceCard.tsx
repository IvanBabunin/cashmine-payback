import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Text } from '@/components/shared/ui';
import { formatAmount, formatUsd } from '@/helpers/format/amount';
import type { DisplayBalance } from '@/helpers/reconcile-balances';
import { makeStyles } from '@/theme';

import { CoinBadge } from './CoinBadge';

type BalanceCardProps = {
  balance: DisplayBalance;
  onClaim: () => void;
};

export function BalanceCard({ balance, onClaim }: BalanceCardProps) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const canClaim = balance.available > 0n;

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <CoinBadge asset={balance.asset} />
        <Text variant="subtitle" style={styles.flex}>
          {balance.asset}
        </Text>
        <Text variant="subtitle" tabular selectable>
          {formatUsd(balance.usdCents)}
        </Text>
      </View>
      <View style={styles.stats}>
        <Stat label={t('available')} units={balance.available} decimals={balance.decimals} />
        <Stat label={t('pending')} units={balance.pending} decimals={balance.decimals} highlight />
        <Stat
          label={t('claiming')}
          units={balance.claiming}
          decimals={balance.decimals}
          highlight
          last
        />
      </View>
      {balance.adjusted ? (
        <Text variant="caption" color="accent">
          {t('adjusted')}
        </Text>
      ) : null}
      <Button
        title={canClaim ? t('claimAsset', { asset: balance.asset }) : t('nothingToClaim')}
        variant="tonal"
        onPress={onClaim}
        disabled={!canClaim}
      />
    </View>
  );
}

type StatProps = {
  label: string;
  units: bigint;
  decimals: number;
  /** Non-zero pending/claiming amounts are in motion, so they take the accent colour. */
  highlight?: boolean;
  last?: boolean;
};

function Stat({ label, units, decimals, highlight, last }: StatProps) {
  const styles = useStyles();
  const zero = units === 0n;
  return (
    <View style={[styles.stat, !last && styles.statDivider]}>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text
        variant="label"
        color={zero ? 'textMuted' : highlight ? 'accent' : 'text'}
        tabular
        selectable
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatAmount(units, decimals)}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  flex: { flex: 1 },
  stats: {
    flexDirection: 'row',
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.inset,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    gap: t.spacing.xs,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  statDivider: { borderRightWidth: 1, borderRightColor: t.colors.border },
}));
