import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Banner, Button, Text } from '@/components/shared/ui';
import { formatAmount, receiveAmount, toUnits } from '@/helpers/format/amount';
import type { ClaimOptions, CreateClaimBody } from '@/types/models/claim';
import { makeStyles } from '@/theme';

import { SummaryRow } from './SummaryRow';

type ClaimReviewProps = {
  body: CreateClaimBody;
  decimals: number;
  options: ClaimOptions;
  submitting: boolean;
  /** The outcome of the last attempt could not be confirmed; retrying reuses the same key. */
  unknown: boolean;
  rejectedMessage?: string;
  onConfirm: () => void;
  onBack: () => void;
};

export function ClaimReview({
  body,
  decimals,
  options,
  submitting,
  unknown,
  rejectedMessage,
  onConfirm,
  onBack,
}: ClaimReviewProps) {
  const { t } = useTranslation('claims');
  const styles = useStyles();
  const amount = toUnits(body.amount, decimals);
  const fee = toUnits(options.fee, decimals);
  const fmt = (units: bigint) => `${formatAmount(units, decimals)} ${body.asset}`;
  const destination = options.destinations.find((d) => d.id === body.destinationId);

  return (
    <View style={styles.root}>
      <Text variant="subtitle">{t('reviewTitle')}</Text>
      <View style={styles.summary}>
        <SummaryRow label={t('amount')} value={fmt(amount)} />
        <SummaryRow label={t('fee')} value={`− ${fmt(fee)}`} />
        <SummaryRow label={t('receive')} value={fmt(receiveAmount(amount, fee))} strong />
        <SummaryRow label={t('destination')} value={destination?.label ?? body.destinationId} />
      </View>
      {unknown ? (
        <Banner tone="warning" title={t('unknownTitle')} description={t('unknownDescription')} />
      ) : null}
      {rejectedMessage ? (
        <Banner tone="danger" title={t('rejected', { message: rejectedMessage })} />
      ) : null}
      <Button
        title={unknown ? t('unknownAction') : t('confirm')}
        loading={submitting}
        onPress={onConfirm}
      />
      {/* Editing after an unknown outcome would need a new key and could double-claim. */}
      {!unknown ? (
        <Button title={t('back')} variant="ghost" disabled={submitting} onPress={onBack} />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing.md },
  summary: {
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
}));
