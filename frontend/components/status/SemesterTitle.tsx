import { Pressable, StyleSheet, Text } from 'react-native';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
};

export function SemesterTitle({ label, onPress }: Props) {
  const { tokens, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, { backgroundColor: isDark ? tokens.surface : '#f3f4f6' }]}
      accessibilityRole="button"
      hitSlop={6}
    >
      <Text style={[styles.label, { color: tokens.text }]}>{label}</Text>
      <DiamondIcon size={10} color={tokens.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
