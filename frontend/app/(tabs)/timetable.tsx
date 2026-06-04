import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { AddSemesterRow } from '@/components/timetable/AddSemesterRow';
import { FilterChipRow } from '@/components/timetable/FilterChipRow';
import { FilterModeBar } from '@/components/timetable/FilterModeBar';
import { PrerequisiteWarningAlert } from '@/components/timetable/PrerequisiteWarningAlert';
import { SemesterRow } from '@/components/timetable/SemesterRow';
import { TrashDropZone } from '@/components/timetable/TrashDropZone';
import { UNPLACED_LIST_ID, UnplacedCourseRow } from '@/components/timetable/UnplacedCourseRow';
import { categoryIdFromKo } from '@/constants/Categories';
import { subtopicIdFromKo } from '@/constants/Subtopics';
import { DnDProvider } from '@/hooks/useDnD';
import { type ApiCourse, listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';
import {
  type FilterMode,
  type TimetableCard,
} from '@/lib/mocks/timetableFixture';
import type { CategoryId, SubtopicId } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCart } from '@/lib/timetable/CartContext';

type CardLists = Record<string, TimetableCard[]>;

function isCardVisible(
  card: TimetableCard,
  course: ApiCourse | undefined,
  mode: FilterMode,
  gradeChip: CategoryId | null,
  subjectChip: SubtopicId | null,
): boolean {
  if (mode === 'grade' && gradeChip) {
    if (!course) return false;
    return categoryIdFromKo(course.category) === gradeChip;
  }
  if (mode === 'subject' && subjectChip) {
    if (!course) return false;
    return course.sectors.some((label) => subtopicIdFromKo(label) === subjectChip);
  }
  return true;
}

export default function Timetable() {
  const { tokens } = useTheme();
  const [mode, setMode] = useState<FilterMode>('grade');
  const [gradeChip, setGradeChip] = useState<CategoryId | null>(null);
  const [subjectChip, setSubjectChip] = useState<SubtopicId | null>(null);
  const {
    lists,
    semesters,
    handleDrop,
    loading: roadmapLoading,
    error: roadmapError,
    newWarnings,
    dismissWarnings,
    addExtraSemester,
    removeExtraSemester,
    isExtraSemester,
  } = useCart();

  const { data: courses, loading: coursesLoading, error: coursesError } = useApi(
    () => listCourses(),
    [],
  );

  const loading = coursesLoading || roadmapLoading;
  const error = coursesError ?? roadmapError;

  const courseByCode = useMemo<Map<string, ApiCourse>>(
    () => new Map((courses ?? []).map((c) => [c.courseCode, c])),
    [courses],
  );

  const visibleByList = useMemo<CardLists>(() => {
    const out: CardLists = {};
    for (const [listId, cards] of Object.entries(lists)) {
      out[listId] = cards.filter((card) =>
        isCardVisible(card, courseByCode.get(card.code), mode, gradeChip, subjectChip),
      );
    }
    return out;
  }, [lists, courseByCode, mode, gradeChip, subjectChip]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top']}>
      <AppHeader title="Timetable" />
      <PrerequisiteWarningAlert warnings={newWarnings} onDismiss={dismissWarnings} />
      <DnDProvider onDrop={handleDrop}>
        <View style={[styles.stickyTop, { backgroundColor: tokens.background, borderColor: tokens.border }]}>
          <FilterModeBar active={mode} onSelect={setMode} />
          <FilterChipRow
            mode={mode}
            gradeChip={gradeChip}
            subjectChip={subjectChip}
            onGradeChange={setGradeChip}
            onSubjectChange={setSubjectChip}
          />
          {mode === 'credits' ? null : (
            <UnplacedCourseRow
              cards={lists[UNPLACED_LIST_ID]}
              visibleCards={visibleByList[UNPLACED_LIST_ID]}
              courseByCode={courseByCode}
            />
          )}
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error.message}</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {semesters.map((sem) => (
              <SemesterRow
                key={sem.id}
                semester={sem}
                cards={lists[sem.id] ?? []}
                visibleCards={visibleByList[sem.id] ?? []}
                courseByCode={courseByCode}
                onDelete={
                  isExtraSemester(sem.id) ? () => void removeExtraSemester(sem.id) : undefined
                }
              />
            ))}
            <AddSemesterRow onPress={addExtraSemester} />
          </ScrollView>
        )}
        <TrashDropZone />
      </DnDProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  stickyTop: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#dc2626',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
