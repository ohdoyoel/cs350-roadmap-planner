import { Pressable, StyleSheet, Text } from 'react-native';
import { SUBTOPICS } from '@/constants/Subtopics';
import type { SubtopicId } from '@/lib/mocks/types';

type Props = {
  subtopicId: SubtopicId;
  onPress?: () => void;
};

export function SectorChip({ subtopicId, onPress }: Props) {
  const token = SUBTOPICS[subtopicId];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: token.dotColor }]}
      accessibilityRole="button"
    >
      <Text style={styles.label} numberOfLines={2}>
        {token.label_ko}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 100,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export const KEY_COURSE_CHIP_COLOR = '#7c4a1a';
