import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';

type Props = {
  course: ApiCourse;
  onClose: () => void;
  onAddToPlanned: () => void;
  onFindInTree: () => void;
};

export function CourseDetailPanel({ course, onClose, onAddToPlanned, onFindInTree }: Props) {
  const catId = categoryIdFromKo(course.category);
  const catLabel = catId ? CATEGORIES[catId].label_ko : course.category;
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <View style={styles.row}>
          <Text style={styles.code}>{course.courseCode}</Text>
          <View style={styles.dots}>
            {course.sectors.map((label) => {
              const id = subtopicIdFromKo(label);
              const color = id ? SUBTOPICS[id].dotColor : '#9ca3af';
              return <View key={label} style={[styles.dot, { backgroundColor: color }]} />;
            })}
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Ionicons name="close" size={20} color="#111" />
        </Pressable>
      </View>
      <Text style={styles.name}>{course.courseName}</Text>
      <Text style={styles.subtitle}>
        {[catLabel, ...course.sectors].filter(Boolean).join(', ')}
      </Text>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Row
          label="선행 과목"
          value={course.prerequisites.length > 0 ? course.prerequisites.join(', ') : '없음'}
        />
        <Row label="학점" value={String(course.credit.credit)} />
        <Row label="설명" value={`${course.courseName}에 대한 설명`} />
      </ScrollView>
      <View style={styles.actions}>
        <Pressable onPress={onAddToPlanned} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionText}>선택한 과목에 추가</Text>
        </Pressable>
        <Pressable onPress={onFindInTree} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionText}>트리에서 찾기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.bodyText}>
      <Text style={styles.bodyLabel}>{label}</Text> {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#111',
    fontWeight: '700',
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#111',
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#6b7280',
  },
  body: { marginTop: 10, flex: 1 },
  bodyContent: { gap: 6, paddingBottom: 12 },
  bodyText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#374151',
    lineHeight: 18,
  },
  bodyLabel: {
    fontWeight: '700',
    color: '#111',
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
    fontFamily: 'Georgia',
    color: '#92400e',
  },
});
