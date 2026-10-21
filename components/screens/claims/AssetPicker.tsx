import { Pressable, View } from 'react-native';

import { Text } from '@/components/shared/ui';
import { makeStyles } from '@/theme';

type AssetPickerProps = {
  assets: string[];
  selected: string;
  disabled?: boolean;
  onSelect: (asset: string) => void;
};

export function AssetPicker({ assets, selected, disabled, onSelect }: AssetPickerProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      {assets.map((asset) => {
        const active = asset === selected;
        return (
          <Pressable
            key={asset}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            onPress={() => onSelect(asset)}
            style={[styles.chip, active && styles.active]}
          >
            <Text variant="label" color={active ? 'onPrimary' : 'text'}>
              {asset}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  chip: {
    minHeight: 40,
    paddingHorizontal: t.spacing.lg,
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  active: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
}));
