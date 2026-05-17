import { ScrollView, StyleSheet } from 'react-native';
import { CourseCard } from '@/components/timetable/CourseCard';
import { Draggable } from '@/components/timetable/Draggable';
import { Droppable } from '@/components/timetable/Droppable';
import type { ApiCourse } from '@/lib/api/courses';
import type { TimetableCard } from '@/lib/mocks/timetableFixture';

export const UNPLACED_LIST_ID = 'unplaced';

type Props = {
  cards: TimetableCard[];
  visibleCards: TimetableCard[];
  courseByCode: Map<string, ApiCourse>;
};

export function UnplacedCourseRow({ cards, visibleCards, courseByCode }: Props) {
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
      listId={UNPLACED_LIST_ID}
      visibleCardIds={visibleCards.map((c) => c.id)}
      mapVisibleToFullIndex={mapVisibleToFullIndex}
      style={styles.wrap}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {visibleCards.map((card) => (
          <Draggable key={card.id} cardId={card.id} fromListId={UNPLACED_LIST_ID}>
            <CourseCard card={card} course={courseByCode.get(card.code)} />
          </Draggable>
        ))}
      </ScrollView>
    </Droppable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 6,
    minHeight: 72,
  },
  row: {
    gap: 8,
    paddingHorizontal: 4,
  },
});
