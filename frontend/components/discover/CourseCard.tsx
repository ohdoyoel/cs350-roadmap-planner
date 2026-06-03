import { StyleSheet, Text, View } from 'react-native';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  course: ApiCourse;
};

export function CourseCard({ course }: Props) {
  const { tokens, isDark } = useTheme();
  const { pick } = useLocale();
  const semesterLabel = course.offeredSemesters.join('/');
  const displayName = pick({ ko: course.courseName, en: course.courseNameEn });

  const baseBg = isDark ? tokens.surface : '#fff';
  const cardStyle = [
    styles.card,
    { backgroundColor: baseBg, borderColor: tokens.border },
  ];
  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        <Text style={[styles.code, { color: tokens.text }]}>{course.courseCode}</Text>
        <View style={styles.dots}>
          {course.sectors.map((label) => {
            const id = subtopicIdFromKo(label);
            const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
            return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
          })}
        </View>
      </View>
      <Text style={[styles.name, { color: tokens.text }]} numberOfLines={2}>
        {displayName}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.meta, { color: tokens.subtext }]}>{semesterLabel}</Text>
        <Text style={[styles.meta, { color: tokens.subtext }]}>{course.credit.raw}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    gap: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontSize: 10,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  footer: {
    gap: 1,
    marginTop: 'auto',
  },
  meta: {
    fontSize: 8,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
