import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/shared/ui';
import type { Claim } from '@/types/models/claim';
import { makeStyles, useTheme } from '@/theme';

import { SummaryRow } from './SummaryRow';

type ClaimStatusCardProps = {
  claim: Claim;
};

export function ClaimStatusCard({ claim }: ClaimStatusCardProps) {
  const { t } = useTranslation('claims');
  const styles = useStyles();
  const theme = useTheme();
  const fmt = (value: string) => `${value} ${claim.asset}`;

  return (
    <View style={styles.root}>
      <View style={styles.status}>
        {claim.status === 'pending' ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <MaterialDesignIcons
            name={claim.status === 'completed' ? 'check-circle' : 'alert-circle'}
            size={56}
            color={claim.status === 'completed' ? theme.colors.success : theme.colors.danger}
          />
        )}
        <Text variant="subtitle" align="center">
          {t(`status.${claim.status}`)}
        </Text>
        <Text color="textMuted" align="center">
          {t(`status.${claim.status}Description`, {
            amount: claim.receiveAmount,
            asset: claim.asset,
          })}
        </Text>
        {claim.failureReason ? (
          <Text color="danger" align="center">
            {t('reason', { reason: claim.failureReason })}
          </Text>
        ) : null}
      </View>
      <View style={styles.summary}>
        <SummaryRow label={t('amount')} value={fmt(claim.amount)} />
        <SummaryRow label={t('fee')} value={`− ${fmt(claim.fee)}`} />
        <SummaryRow label={t('receive')} value={fmt(claim.receiveAmount)} strong />
        <SummaryRow label={t('id')} value={claim.id} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing.xl },
  status: { alignItems: 'center', gap: t.spacing.sm, paddingTop: t.spacing.xl },
  summary: {
    gap: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
  },
}));
