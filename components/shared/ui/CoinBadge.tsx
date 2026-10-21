import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { Text } from './Text';
import { assetColors, makeStyles, useTheme } from '@/theme';

type IconName = ComponentProps<typeof MaterialDesignIcons>['name'];

const ICONS: Record<string, IconName> = {
  USDT: 'currency-usd',
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

type CoinBadgeProps = {
  asset: string;
  size?: 'md' | 'sm';
};

export function CoinBadge({ asset, size = 'md' }: CoinBadgeProps) {
  const styles = useStyles();
  const theme = useTheme();
  const icon = ICONS[asset];
  return (
    <View
      style={[
        styles.root,
        styles[size],
        { backgroundColor: assetColors[asset] ?? theme.colors.textMuted },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {icon ? (
        <MaterialDesignIcons
          name={icon}
          size={size === 'md' ? 22 : 18}
          color={theme.colors.onAccent}
        />
      ) : (
        <Text variant="label" color="onAccent">
          {asset.slice(0, 1)}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  md: { width: 40, height: 40 },
  sm: { width: 36, height: 36 },
  root: {
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
