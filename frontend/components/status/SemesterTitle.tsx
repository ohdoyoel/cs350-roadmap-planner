import { Pressable, StyleSheet, Text } from 'react-native';
import { DiamondIcon } from '@/components/icons/DiamondIcon';

type Props = {
  label: string;
  onPress: () => void;
};

export function SemesterTitle({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.pill}
      accessibilityRole="button"
      hitSlop={6}
    >
      <Text style={styles.label}>{label}</Text>
      <DiamondIcon size={10} />
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
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#111',
  },
});
