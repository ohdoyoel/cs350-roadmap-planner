import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CourseCard } from '@/components/timetable/CourseCard';
import { Draggable } from '@/components/timetable/Draggable';
import { Droppable } from '@/components/timetable/Droppable';
import type { ApiCourse } from '@/lib/api/courses';
import type { Semester, TimetableCard } from '@/lib/mocks/timetableFixture';

type Props = {
  semester: Semester;
  cards: TimetableCard[];           // 실제 state
  visibleCards: TimetableCard[];    // chip 필터 적용된 표시 카드
  courseByCode: Map<string, ApiCourse>;
};

export function SemesterRow({ semester, cards, visibleCards, courseByCode }: Props) {
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
        <Text style={styles.label}>{semester.label}</Text>
        {totalCredits > 0 ? <Text style={styles.credit}>{totalCredits}학점</Text> : null}
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
  label: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#111827',
  },
  credit: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  cards: {
    gap: 8,
    paddingRight: 8,
    minHeight: 84,
  },
});
