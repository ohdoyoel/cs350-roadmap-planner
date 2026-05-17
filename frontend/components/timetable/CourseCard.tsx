import { StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import type { TimetableCard } from '@/lib/mocks/timetableFixture';

type Props = {
  card: TimetableCard;
  course?: ApiCourse;
};

export function CourseCard({ card, course }: Props) {
  const variant = card.variant ?? 'big';
  const name = course?.courseName ?? card.code;
  const categoryId = course ? categoryIdFromKo(course.category) : undefined;
  const categoryLabel = categoryId ? CATEGORIES[categoryId].label_ko : course?.category ?? '';
  const credit = course?.credit.credit;
  const subtopicIds = (course?.sectors ?? [])
    .map((label) => subtopicIdFromKo(label))
    .filter((id): id is NonNullable<typeof id> => Boolean(id));

  if (variant === 'small') {
    return (
      <View style={styles.smallCard}>
        <View style={styles.smallHead}>
          <Text style={styles.smallCode}>{card.code}</Text>
          <DotStack subtopicIds={subtopicIds} />
        </View>
        <Text style={styles.smallName} numberOfLines={2}>
          {name}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.bigCard}>
      <View style={styles.bigHead}>
        <Text style={styles.bigCode}>{card.code}</Text>
        <DotStack subtopicIds={subtopicIds} />
      </View>
      <Text style={styles.bigName} numberOfLines={2}>
        {name}
      </Text>
      {categoryLabel ? <Text style={styles.bigCategory}>{categoryLabel}</Text> : null}
      {credit != null ? <Text style={styles.bigCredit}>{credit}학점</Text> : null}
    </View>
  );
}

function DotStack({ subtopicIds }: { subtopicIds: Array<keyof typeof SUBTOPICS> }) {
  if (subtopicIds.length === 0) return null;
  return (
    <View style={styles.dotStack}>
      {subtopicIds.map((id) => (
        <View key={id} style={[styles.dot, { backgroundColor: SUBTOPICS[id].dotColor }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  smallCard: {
    width: 100,
    minHeight: 64,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 2,
  },
  smallHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  smallCode: {
    fontSize: 10,
    fontFamily: 'Georgia',
    color: '#111827',
  },
  smallName: {
    fontSize: 10,
    fontFamily: 'Georgia',
    color: '#374151',
    lineHeight: 13,
  },
  bigCard: {
    width: 108,
    minHeight: 82,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 2,
  },
  bigHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bigCode: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#111827',
  },
  bigName: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#374151',
    lineHeight: 14,
  },
  bigCategory: {
    fontSize: 9,
    fontFamily: 'Georgia',
    color: '#6b7280',
    marginTop: 2,
  },
  bigCredit: {
    fontSize: 9,
    fontFamily: 'Georgia',
    color: '#6b7280',
  },
  dotStack: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
