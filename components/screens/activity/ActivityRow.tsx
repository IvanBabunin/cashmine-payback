import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/shared/ui';
import type { ActivityItem } from '@/types/models/activity';
import { makeStyles, type Colors } from '@/theme';

type ActivityRowProps = {
  item: ActivityItem;
};

const STATUS_COLOR: Record<ActivityItem['status'], keyof Colors> = {
  pending: 'warning',
  confirmed: 'textMuted',
  completed: 'success',
  failed: 'danger',
};

export function ActivityRow({ item }: ActivityRowProps) {
  const { t } = useTranslation('activity');
  const styles = useStyles();
  const negative = item.amount.startsWith('-');
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(item.createdAt),
  );

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <Text variant="label">
          {t(`type.${item.type}`)}
          {item.exchange ? ` · ${item.exchange}` : ''}
        </Text>
        <Text variant="caption" color="textMuted">
          {date}
        </Text>
      </View>
      <View style={styles.right}>
        <Text variant="label" color={negative ? 'text' : 'success'} selectable tabular>
          {negative ? item.amount : `+${item.amount}`} {item.asset}
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
    justifyContent: 'space-between',
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  left: { flex: 1, gap: t.spacing.xs },
  right: { alignItems: 'flex-end', gap: t.spacing.xs },
}));
