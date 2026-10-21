import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Text } from '@/components/shared/ui';
import { formatAmount, formatUsd } from '@/helpers/format/amount';
import type { DisplayBalance } from '@/helpers/reconcile-balances';
import { makeStyles } from '@/theme';

type BalanceCardProps = {
  balance: DisplayBalance;
  onClaim: () => void;
};

export function BalanceCard({ balance, onClaim }: BalanceCardProps) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const fmt = (units: bigint) => `${formatAmount(units, balance.decimals)} ${balance.asset}`;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="subtitle">{balance.asset}</Text>
        <Text color="textMuted">{formatUsd(balance.usdCents)}</Text>
      </View>
      <Row label={t('available')} value={fmt(balance.available)} strong />
      <Row label={t('pending')} value={fmt(balance.pending)} />
      <Row label={t('claiming')} value={fmt(balance.claiming)} />
      {balance.adjusted ? (
        <Text variant="caption" color="accent">
          {t('adjusted')}
        </Text>
      ) : null}
      <Button
        title={t('claim')}
        variant="secondary"
        onPress={onClaim}
        disabled={balance.available === 0n}
      />
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <Text variant={strong ? 'label' : 'body'} style={styles.value} selectable tabular>
        {value}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: t.spacing.md },
  value: { flexShrink: 1, textAlign: 'right' },
}));
