import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CourseCard } from '@/components/timetable/CourseCard';
import { Draggable } from '@/components/timetable/Draggable';
import { Droppable } from '@/components/timetable/Droppable';
import type { ApiCourse } from '@/lib/api/courses';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { Semester, TimetableCard } from '@/lib/mocks/timetableFixture';

type Props = {
  semester: Semester;
  cards: TimetableCard[];           // 실제 state
  visibleCards: TimetableCard[];    // chip 필터 적용된 표시 카드
  courseByCode: Map<string, ApiCourse>;
  onDelete?: () => void;
};

export function SemesterRow({ semester, cards, visibleCards, courseByCode, onDelete }: Props) {
  const { t, pick } = useLocale();
  const totalCredits = cards.reduce(
    (sum, c) => sum + (courseByCode.get(c.code)?.credit.credit ?? 0),
    0,
  );
  const isCurrent = semester.status === 'current';
  const isPast = semester.status === 'past';

  const mapVisibleToFullIndex = (visibleIndex: number): number => {
    if (visibleIndex >= visibleCards.length) {
      if (visibleCards.length === 0) return cards.length;
      const last = visibleCards[visibleCards.length - 1];
      const pos = cards.findIndex((c) => c.id === last.id);
      return pos >= 0 ? pos + 1 : cards.length;
    }
    const target = visibleCards[visibleIndex];
    const pos = cards.findIndex((c) => c.id === target.id);
    return pos >= 0 ? pos : cards.length;
  };

  return (
    <Droppable
      listId={semester.id}
      visibleCardIds={visibleCards.map((c) => c.id)}
      mapVisibleToFullIndex={mapVisibleToFullIndex}
      style={[
        styles.row,
        { backgroundColor: semester.bgColor },
        isCurrent && styles.rowCurrent,
        isPast && styles.rowPast,
      ]}
    >
      <View style={styles.head}>
        <Text style={styles.label}>{pick({ ko: semester.label_ko, en: semester.label_en })}</Text>
        <View style={styles.headRight}>
          {totalCredits > 0 ? (
            <Text style={styles.credit}>
              {totalCredits}
              {t('학점', ' credits')}
            </Text>
          ) : null}
          {onDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Delete semester"
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            >
              <Ionicons name="close" size={14} color="#6b7280" />
            </Pressable>
          ) : null}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {visibleCards.map((card) => (
          <Draggable key={card.id} cardId={card.id} fromListId={semester.id}>
            <CourseCard card={card} course={courseByCode.get(card.code)} />
          </Draggable>
        ))}
      </ScrollView>
    </Droppable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 124,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  rowCurrent: {
    borderWidth: 1.5,
    borderColor: '#a78bfa',
  },
  rowPast: {
    opacity: 0.92,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111827',
  },
  credit: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  cards: {
    gap: 8,
    paddingRight: 8,
    minHeight: 84,
  },
});
