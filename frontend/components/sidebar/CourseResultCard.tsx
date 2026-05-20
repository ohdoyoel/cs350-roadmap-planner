import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';

type Props = {
  course: ApiCourse;
  onPress: () => void;
};

export function CourseResultCard({ course, onPress }: Props) {
  const catId = categoryIdFromKo(course.category);
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.head}>
        <Text style={styles.code}>{course.courseCode}</Text>
        <View style={styles.dots}>
          {course.sectors.map((label) => {
            const id = subtopicIdFromKo(label);
            const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
            return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
          })}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {course.courseName}
      </Text>
      <Text style={styles.meta}>{catId ? CATEGORIES[catId].label_ko : course.category}</Text>
      {course.sectors.length > 0 ? (
        <Text style={styles.meta}>{course.sectors.join(', ')}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 3,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#111',
    fontWeight: '600',
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#6b7280',
  },
});
