import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Коли над екраном є хедер навігації, верхній відступ не потрібен. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
  refreshControl?: ScrollViewProps['refreshControl'];
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['bottom'],
  contentStyle,
  refreshControl,
}: ScreenProps) {
  const styles = useStyles();
  const content = [padded && styles.padded, contentStyle];

  return (
    <SafeAreaView edges={edges} style={styles.root}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, ...content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  fill: { flex: 1 },
  padded: { padding: t.spacing.lg, gap: t.spacing.lg },
}));
