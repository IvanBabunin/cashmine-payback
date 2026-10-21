import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Banner, Button, Input, Text } from '@/components/shared/ui';
import {
  formatAmount,
  parseAmount,
  receiveAmount,
  toUnits,
  validateClaimAmount,
  type ClaimRules,
} from '@/helpers/format/amount';
import type { ClaimOptions, CreateClaimBody } from '@/types/models/claim';
import { makeStyles } from '@/theme';

import { SummaryRow } from './SummaryRow';

type ClaimFormProps = {
  asset: string;
  decimals: number;
  /** Already reduced by this device's claims that the snapshot does not include yet. */
  available: bigint;
  options: ClaimOptions;
  onReview: (body: CreateClaimBody) => void;
};

export function ClaimForm({ asset, decimals, available, options, onReview }: ClaimFormProps) {
  const { t } = useTranslation('claims');
  const styles = useStyles();
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);
  const [destinationId, setDestinationId] = useState(options.destinations[0]?.id);

  const rules: ClaimRules = {
    decimals,
    available,
    minAmount: toUnits(options.minAmount, decimals),
    fee: toUnits(options.fee, decimals),
  };
  const fmt = (units: bigint) => `${formatAmount(units, decimals)} ${asset}`;
  const error = validateClaimAmount(input, rules);
  const amount = parseAmount(input.trim(), decimals);
  const receive = amount !== null && amount > rules.fee ? receiveAmount(amount, rules.fee) : null;

  if (available < rules.minAmount || available <= rules.fee) {
    return <Banner tone="warning" title={t('notEnough', { amount: options.minAmount, asset })} />;
  }
  if (!destinationId) {
    return <Banner tone="warning" title={t('noDestinations', { asset })} />;
  }

  const submit = () => {
    setTouched(true);
    if (error || amount === null) return;
    onReview({ asset, amount: formatAmount(amount, decimals), destinationId });
  };

  return (
    <View style={styles.root}>
      <View style={styles.amountRow}>
        <View style={styles.flex}>
          <Input
            label={t('amount')}
            placeholder={t('amountPlaceholder')}
            value={input}
            // Accept a comma from European keyboards; everything else must match the API format.
            onChangeText={(v) => setInput(v.replace(',', '.'))}
            onBlur={() => setTouched(true)}
            inputMode="decimal"
            keyboardType="decimal-pad"
            autoCorrect={false}
            error={
              touched && error
                ? t(`errors.${error}`, {
                    asset,
                    decimals,
                    min: options.minAmount,
                    available: formatAmount(available, decimals),
                    fee: options.fee,
                  })
                : undefined
            }
          />
        </View>
        <Button
          title={t('max')}
          variant="secondary"
          style={styles.max}
          onPress={() => {
            setInput(formatAmount(available, decimals));
            setTouched(true);
          }}
        />
      </View>
      <Text variant="caption" color="textMuted">
        {t('available', { amount: formatAmount(available, decimals), asset })} ·{' '}
        {t('min', { amount: options.minAmount, asset })}
      </Text>

      <Text variant="label" color="textMuted">
        {t('destination')}
      </Text>
      {options.destinations.map((d) => (
        <Pressable
          key={d.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: d.id === destinationId }}
          onPress={() => setDestinationId(d.id)}
          style={[styles.destination, d.id === destinationId && styles.destinationActive]}
        >
          <Text>{d.label}</Text>
        </Pressable>
      ))}

      <View style={styles.summary}>
        <SummaryRow label={t('fee')} value={fmt(rules.fee)} />
        <SummaryRow label={t('receive')} value={receive !== null ? fmt(receive) : '—'} strong />
      </View>
      <Button title={t('continue')} onPress={submit} disabled={touched && !!error} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.spacing.md },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.sm },
  flex: { flex: 1 },
  max: { alignSelf: 'flex-start', marginTop: t.typography.label.lineHeight + t.spacing.xs },
  destination: {
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  destinationActive: { borderColor: t.colors.primary },
  summary: {
    gap: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
  },
}));
