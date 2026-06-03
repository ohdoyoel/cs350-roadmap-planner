import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SUBTOPICS } from '@/constants/Subtopics';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SubtopicId } from '@/lib/mocks/types';
import { SectorChip } from './SectorChip';

// SRS Figure 6 좌→우, 위→아래 순서 (2-column).
const LEFT_COLUMN: SubtopicId[] = [
  'data_science',
  'computational_theory',
  'secure_computing',
  'visual_computing',
  'social_computing',
];

const RIGHT_COLUMN: SubtopicId[] = [
  'system_network',
  'software_design',
  'ai_information_service',
  'interactive_computing',
];

type Props = {
  onSelectSector: (id: SubtopicId) => void;
  onSelectKeyCourses?: () => void;
};

export function SectorChipGrid({ onSelectSector, onSelectKeyCourses }: Props) {
  const { t } = useLocale();
  const rows = Math.max(LEFT_COLUMN.length, RIGHT_COLUMN.length + 1);

  return (
    <View style={styles.grid}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          {LEFT_COLUMN[i] ? (
            <SectorChip subtopicId={LEFT_COLUMN[i]} onPress={() => onSelectSector(LEFT_COLUMN[i])} />
          ) : (
            <View style={styles.slot} />
          )}
          {RIGHT_COLUMN[i] ? (
            <SectorChip
              subtopicId={RIGHT_COLUMN[i]}
              onPress={() => onSelectSector(RIGHT_COLUMN[i])}
            />
          ) : i === RIGHT_COLUMN.length ? (
            <Pressable
              onPress={onSelectKeyCourses}
              style={[styles.slot, styles.keyChip]}
              accessibilityRole="button"
            >
              <Text style={styles.keyLabel}>{t('주요 과목', 'Key Courses')}</Text>
            </Pressable>
          ) : (
            <View style={styles.slot} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  slot: {
    width: 100,
    height: 44,
  },
  keyChip: {
    backgroundColor: '#7c4a1a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  keyLabel: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#fff',
    fontWeight: '600',
  },
});

// SubtopicId 외에 주요 과목 sentinel.
export type SelectedSector = SubtopicId | 'key_courses';

// SUBTOPICS lookup 헬퍼는 caller에서 사용.
export function isSubtopicSector(id: SelectedSector): id is SubtopicId {
  return id in SUBTOPICS;
}
