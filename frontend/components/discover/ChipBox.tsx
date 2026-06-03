import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  label: string;
  active: boolean;
  outlineColor: string;
  onPress: () => void;
};

export function ChipBox({ label, active, outlineColor, onPress }: Props) {
  const { tokens, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? tokens.surface : '#fff',
          borderColor: active ? outlineColor : tokens.border,
          borderWidth: active ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: tokens.text }]} ellipsizeMode="clip">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    textAlign: 'center',
  },
});
