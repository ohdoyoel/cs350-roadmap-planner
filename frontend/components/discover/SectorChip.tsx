import { Pressable, StyleSheet, Text } from 'react-native';
import { SUBTOPICS } from '@/constants/Subtopics';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SubtopicId } from '@/lib/mocks/types';

type Props = {
  subtopicId: SubtopicId;
  onPress?: () => void;
};

export function SectorChip({ subtopicId, onPress }: Props) {
  const token = SUBTOPICS[subtopicId];
  const { pick } = useLocale();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: token.dotColor }]}
      accessibilityRole="button"
    >
      <Text style={styles.label} numberOfLines={2}>
        {pick({ ko: token.label_ko, en: token.label_en })}
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export const KEY_COURSE_CHIP_COLOR = '#7c4a1a';
