import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChipRow } from '@/components/status/CategoryChipRow';
import { CourseListItem } from '@/components/status/CourseListItem';
import { RequirementProgressList } from '@/components/status/RequirementProgressList';
import { SemesterPicker } from '@/components/status/SemesterPicker';
import { SemesterTitle } from '@/components/status/SemesterTitle';
import { StatTileGrid } from '@/components/status/StatTileGrid';
import { categoryIdFromKo } from '@/constants/Categories';
import { listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';
import {
  type CourseListEntry,
  CURRENT_SEMESTER_ID,
  type FilterChipId,
  REQUIREMENT_GROUPS,
  SEMESTER_OPTIONS,
  STAT_SUMMARY,
  USER_COURSE_STATES,
} from '@/lib/mocks/statusFixture';
import type { CategoryId } from '@/lib/mocks/types';

// 'Others' 칩이 묶어 보여줄 카테고리 집합.
const OTHERS_CATEGORIES = new Set<CategoryId>([
  'general_required',
  'general_elective',
  'other',
]);

export default function Status() {
  const [activeChip, setActiveChip] = useState<FilterChipId>('all');
  const [semesterId, setSemesterId] = useState(CURRENT_SEMESTER_ID);
  const [pickerOpen, setPickerOpen] = useState(false);

  const semester = useMemo(
    () => SEMESTER_OPTIONS.find((s) => s.id === semesterId) ?? SEMESTER_OPTIONS[0],
    [semesterId],
  );

  const { data: courses, loading, error } = useApi(() => listCourses(), []);

  const entries = useMemo<CourseListEntry[]>(() => {
    const byCode = new Map((courses ?? []).map((c) => [c.courseCode, c]));
    return USER_COURSE_STATES.map((state) => {
      const course = byCode.get(state.code);
      return {
        code: state.code,
        name_en: course?.courseNameEn ?? course?.courseName ?? state.code,
        credit: course?.credit.credit ?? 0,
        category: course ? categoryIdFromKo(course.category) : undefined,
        status: state.status,
        grade: state.grade,
        gpaPoint: state.gpaPoint,
        plannedAddition: state.plannedAddition,
      };
    });
  }, [courses]);

  const visibleEntries = useMemo(() => {
    if (activeChip === 'all') return entries;
    if (activeChip === 'custom') return entries.filter((e) => !e.category);
    if (activeChip === 'general_elective') {
      return entries.filter((e) => e.category && OTHERS_CATEGORIES.has(e.category));
    }
    return entries.filter((e) => e.category === activeChip);
  }, [activeChip, entries]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader onLeftPress={() => router.push('/settings')}>
        <View style={styles.headerStack}>
          <Text style={styles.headerTitle}>Status</Text>
          <SemesterTitle label={semester.label} onPress={() => setPickerOpen((v) => !v)} />
        </View>
      </AppHeader>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <StatTileGrid summary={STAT_SUMMARY} />
        <Text style={styles.sectionLabel}>Requirement Progress</Text>
        <RequirementProgressList groups={REQUIREMENT_GROUPS} />
        <CategoryChipRow active={activeChip} onSelect={setActiveChip} />
        <Text style={styles.sectionLabel}>Detailed Course List</Text>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.errorText}>{error.message}</Text>
        ) : (
          <View>
            {visibleEntries.length === 0 ? (
              <Text style={styles.emptyText}>해당 카테고리의 과목이 없습니다.</Text>
            ) : (
              visibleEntries.map((entry) => (
                <CourseListItem key={entry.code} entry={entry} />
              ))
            )}
          </View>
        )}
      </ScrollView>
      {pickerOpen ? (
        <SemesterPicker
          options={SEMESTER_OPTIONS}
          selectedId={semesterId}
          onSelect={(id) => {
            setSemesterId(id);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#1f2937',
    marginTop: 4,
  },
  headerStack: {
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#111',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#dc2626',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#6b7280',
    paddingVertical: 12,
  },
});
