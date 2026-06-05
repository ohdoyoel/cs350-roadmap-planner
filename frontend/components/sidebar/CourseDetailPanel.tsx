import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  course: ApiCourse;
  onClose: () => void;
  onAddToPlanned: () => void;
  onFindInTree: () => void;
};

export function CourseDetailPanel({ course, onClose, onAddToPlanned, onFindInTree }: Props) {
  const { tokens } = useTheme();
  const { t, pick, isKo } = useLocale();
  const catId = categoryIdFromKo(course.category);
  const catLabel = catId
    ? (isKo ? CATEGORIES[catId].label_ko : CATEGORIES[catId].label_en)
    : course.category;
  const displayName = pick({ ko: course.courseName, en: course.courseNameEn });
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: tokens.background, borderColor: tokens.border },
      ]}
    >
      <View style={styles.head}>
        <View style={styles.row}>
          <Text style={[styles.code, { color: tokens.text }]}>{course.courseCode}</Text>
          <View style={styles.dots}>
            {course.sectors.map((label) => {
              const id = subtopicIdFromKo(label);
              const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
              return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
            })}
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Ionicons name="close" size={20} color={tokens.text} />
        </Pressable>
      </View>
      <Text style={[styles.name, { color: tokens.text }]}>{displayName}</Text>
      <Text style={[styles.subtitle, { color: tokens.subtext }]}>
        {[catLabel, ...course.sectors.map((s) => {
          const sid = subtopicIdFromKo(s);
          return sid ? (isKo ? SUBTOPICS[sid].label_ko : SUBTOPICS[sid].label_en) : s;
        })].filter(Boolean).join(', ')}
      </Text>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Row
          label={t('선행 과목', 'Prerequisites')}
          value={
            course.prerequisites.length > 0
              ? course.prerequisites.join(', ')
              : t('없음', 'None')
          }
          text={tokens.subtext}
          labelColor={tokens.text}
        />
        <Row
          label={t('학점', 'Credits')}
          value={String(course.credit.credit)}
          text={tokens.subtext}
          labelColor={tokens.text}
        />
        <Row
          label={t('설명', 'Description')}
          value={course.description ?? t('설명이 없습니다.', 'No description available.')}
          text={tokens.subtext}
          labelColor={tokens.text}
        />
      </ScrollView>
      <View style={styles.actions}>
        <Pressable onPress={onAddToPlanned} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionText}>{t('선택한 과목을 추가', 'Add to plan')}</Text>
        </Pressable>
        <Pressable onPress={onFindInTree} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionText}>{t('트리에서 찾기', 'Find in tree')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  text,
  labelColor,
}: {
  label: string;
  value: string;
  text: string;
  labelColor: string;
}) {
  return (
    <Text style={[styles.bodyText, { color: text }]}>
      <Text style={[styles.bodyLabel, { color: labelColor }]}>{label}</Text> {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: {
    fontSize: 16,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontWeight: '700',
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: {
    fontSize: 18,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  body: { marginTop: 10, flex: 1 },
  bodyContent: { gap: 6, paddingBottom: 12 },
  bodyText: {
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    lineHeight: 18,
  },
  bodyLabel: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fef9c3',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#92400e',
  },
});
