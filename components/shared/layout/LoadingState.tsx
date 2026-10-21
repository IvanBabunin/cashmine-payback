import { ActivityIndicator, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

export function LoadingState() {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl },
}));
