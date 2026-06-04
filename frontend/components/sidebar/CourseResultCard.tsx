import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  course: ApiCourse;
  onPress: () => void;
};

export function CourseResultCard({ course, onPress }: Props) {
  const { tokens, isDark } = useTheme();
  const { pick, isKo } = useLocale();
  const catId = categoryIdFromKo(course.category);
  const displayName = pick({ ko: course.courseName, en: course.courseNameEn });
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? tokens.surface : '#fff',
          borderColor: tokens.border,
        },
      ]}
      accessibilityRole="button"
    >
      <View style={styles.head}>
        <Text style={[styles.code, { color: tokens.text }]}>{course.courseCode}</Text>
        <View style={styles.dots}>
          {course.sectors.map((label) => {
            const id = subtopicIdFromKo(label);
            const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
            return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
          })}
        </View>
      </View>
      <Text style={[styles.name, { color: tokens.subtext }]} numberOfLines={1}>
        {displayName}
      </Text>
      <Text style={[styles.meta, { color: tokens.subtext }]}>
        {catId
          ? (isKo ? CATEGORIES[catId].label_ko : CATEGORIES[catId].label_en)
          : course.category}
      </Text>
      {course.sectors.length > 0 ? (
        <Text style={[styles.meta, { color: tokens.subtext }]}>
          {course.sectors
            .map((s) => {
              const sid = subtopicIdFromKo(s);
              return sid ? (isKo ? SUBTOPICS[sid].label_ko : SUBTOPICS[sid].label_en) : s;
            })
            .join(', ')}
        </Text>
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111',
    fontWeight: '600',
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: {
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  meta: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#6b7280',
  },
});
