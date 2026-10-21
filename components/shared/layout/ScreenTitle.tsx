import { Text } from '@/components/shared/ui';
import { makeStyles } from '@/theme';

type ScreenTitleProps = {
  title: string;
};

/** Large in-screen title used by every tab, so all tabs share one size and position. */
export function ScreenTitle({ title }: ScreenTitleProps) {
  const styles = useStyles();
  return (
    <Text variant="title" accessibilityRole="header" style={styles.root}>
      {title}
    </Text>
  );
}

const useStyles = makeStyles((t) => ({
  root: { paddingTop: t.spacing.sm },
}));
