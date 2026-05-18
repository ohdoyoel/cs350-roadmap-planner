import { StyleSheet, Text, View } from 'react-native';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import { useFocus } from '@/lib/discover/FocusContext';

type Props = {
  course: ApiCourse;
};

export function CourseCard({ course }: Props) {
  const { focus } = useFocus();
  const isFocused = focus?.code === course.courseCode;
  const semesterLabel = course.offeredSemesters.join('/');
  const cardStyle = [
    styles.card,
    course.isKeyCourse && styles.cardKey,
    isFocused && styles.cardFocused,
  ];
  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        <Text style={styles.code}>{course.courseCode}</Text>
        <View style={styles.dots}>
          {course.sectors.map((label) => {
            const id = subtopicIdFromKo(label);
            const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
            return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
          })}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {course.courseName}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{semesterLabel}</Text>
        <Text style={styles.meta}>{course.credit.raw}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    gap: 3,
  },
  cardKey: {
    borderColor: '#92400e',
  },
  cardFocused: {
    backgroundColor: '#d1d5db',
    borderColor: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontSize: 10,
    fontFamily: 'Georgia',
    color: '#111',
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: 9,
    fontFamily: 'Georgia',
    color: '#1f2937',
  },
  footer: {
    gap: 1,
    marginTop: 'auto',
  },
  meta: {
    fontSize: 8,
    fontFamily: 'Georgia',
    color: '#6b7280',
  },
});
