import { View } from 'react-native';

import { Text } from '@/components/shared/ui';
import { makeStyles } from '@/theme';

type SummaryRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

export function SummaryRow({ label, value, strong }: SummaryRowProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <Text variant={strong ? 'subtitle' : 'body'} style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  value: { flexShrink: 1, textAlign: 'right' },
}));
