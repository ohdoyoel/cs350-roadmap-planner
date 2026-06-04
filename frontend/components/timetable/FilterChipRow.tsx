import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '@/constants/Categories';
import { SUBTOPICS } from '@/constants/Subtopics';
import { useLocale } from '@/lib/locale/LocaleContext';
import {
  CREDIT_CHIPS,
  GRADE_CHIPS,
  SUBJECT_CHIPS,
  type FilterMode,
} from '@/lib/mocks/timetableFixture';
import type { CategoryId, SubtopicId } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  mode: FilterMode;
  gradeChip: CategoryId | null;
  subjectChip: SubtopicId | null;
  onGradeChange: (id: CategoryId | null) => void;
  onSubjectChange: (id: SubtopicId | null) => void;
};

export function FilterChipRow({
  mode,
  gradeChip,
  subjectChip,
  onGradeChange,
  onSubjectChange,
}: Props) {
  const { tokens, isDark } = useTheme();
  const { isKo } = useLocale();
  if (mode === 'grade') {
    return (
      <Row>
        {GRADE_CHIPS.map((id) => {
          const cat = CATEGORIES[id];
          const active = gradeChip === id;
          return (
            <Pressable
              key={id}
              onPress={() => onGradeChange(active ? null : id)}
              style={[styles.chip, { backgroundColor: cat.chipColor }, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {isKo ? cat.label_ko : cat.label_en}
              </Text>
            </Pressable>
          );
        })}
      </Row>
    );
  }
  if (mode === 'subject') {
    return (
      <Row>
        {SUBJECT_CHIPS.map((id) => {
          const sub = SUBTOPICS[id];
          const active = subjectChip === id;
          return (
            <Pressable
              key={id}
              onPress={() => onSubjectChange(active ? null : id)}
              style={[styles.chip, { backgroundColor: sub.bgColor }, active && styles.chipActive]}
            >
              <View style={[styles.dot, { backgroundColor: sub.dotColor }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {isKo ? sub.label_ko : sub.label_en}
              </Text>
            </Pressable>
          );
        })}
      </Row>
    );
  }
  // credits — read-only progress badges
  return (
    <Row>
      {CREDIT_CHIPS.map((chip) => {
        const cat = CATEGORIES[chip.id];
        const plannedSuffix = chip.planned > 0 ? `(+${chip.planned})` : '';
        return (
          <View
            key={chip.id}
            style={[
              styles.creditChip,
              { borderColor: cat.chipColor, backgroundColor: isDark ? tokens.surface : '#fff' },
            ]}
          >
            <Text style={[styles.creditChipLabel, { color: tokens.subtext }]}>{isKo ? cat.label_ko : cat.label_en}</Text>
            <Text style={[styles.creditChipValue, { color: tokens.text }]}>
              {chip.earned}
              {plannedSuffix}/{chip.required}
            </Text>
          </View>
        );
      })}
    </Row>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingVertical: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: '#7c3aed',
  },
  chipText: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  chipTextActive: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontWeight: '600',
    color: '#111',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  creditChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  creditChipLabel: {
    fontSize: 10,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  creditChipValue: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111827',
    marginTop: 1,
  },
});
