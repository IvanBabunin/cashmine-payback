import type { ReactNode } from 'react';
import { View } from 'react-native';

import { makeStyles, type Colors } from '@/theme';

import { Text } from './Text';

type BannerProps = {
  title: string;
  description?: string;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  action?: ReactNode;
};

const TONE_COLOR: Record<NonNullable<BannerProps['tone']>, keyof Colors> = {
  info: 'primary',
  warning: 'warning',
  danger: 'danger',
  success: 'success',
};

export function Banner({ title, description, tone = 'info', action }: BannerProps) {
  const styles = useStyles();
  return (
    <View style={[styles.root, styles[tone]]}>
      <Text variant="label" color={TONE_COLOR[tone]}>
        {title}
      </Text>
      {description ? (
        <Text variant="caption" color="textMuted">
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    gap: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    backgroundColor: t.colors.surface,
  },
  info: { borderColor: t.colors.primary },
  warning: { borderColor: t.colors.warning },
  danger: { borderColor: t.colors.danger },
  success: { borderColor: t.colors.success },
}));
