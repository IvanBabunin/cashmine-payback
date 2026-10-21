import type { ReactNode } from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/theme';

type AppFrameProps = {
  children: ReactNode;
};

/** На десктопі застосунок — колонка шириною з телефон по центру. */
export function AppFrame({ children }: AppFrameProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.field },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: t.layout.maxWidth,
    alignSelf: 'center',
    backgroundColor: t.colors.background,
  },
}));
