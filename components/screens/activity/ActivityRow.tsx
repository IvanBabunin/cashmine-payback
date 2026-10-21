import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CoinBadge, Text } from '@/components/shared/ui';
import type { ActivityItem } from '@/types/models/activity';
import { makeStyles, type Colors } from '@/theme';

type ActivityRowProps = {
  item: ActivityItem;
};

const STATUS_COLOR: Record<ActivityItem['status'], keyof Colors> = {
  pending: 'accent',
  confirmed: 'textMuted',
  completed: 'success',
  failed: 'danger',
};

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function ActivityRow({ item }: ActivityRowProps) {
  const { t } = useTranslation('activity');
  const styles = useStyles();
  const negative = item.amount.startsWith('-');

  return (
    <View style={styles.root}>
      <CoinBadge asset={item.asset} size="sm" />
      <View style={styles.left}>
        <Text variant="label" numberOfLines={1}>
          {t(`type.${item.type}`)}
          {item.exchange ? (
            <Text variant="label" color="textMuted">
              {` · ${item.exchange}`}
            </Text>
          ) : null}
        </Text>
        <Text variant="caption" color="textMuted">
          {DATE_FORMAT.format(new Date(item.createdAt))}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          variant="label"
          color={negative ? 'text' : 'success'}
          tabular
          selectable
          style={styles.amount}
        >
          {negative ? item.amount.replace('-', '−') : `+${item.amount}`} {item.asset}
        </Text>
        <Text variant="caption" color={STATUS_COLOR[item.status]}>
          {t(`status.${item.status}`)}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
  },
  left: { flex: 1, minWidth: 0, gap: t.spacing.xs },
  right: { flexShrink: 1, alignItems: 'flex-end', gap: t.spacing.xs },
  amount: { textAlign: 'right' },
}));
