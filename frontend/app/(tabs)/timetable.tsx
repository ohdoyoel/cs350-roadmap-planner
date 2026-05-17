import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { AddSemesterRow } from '@/components/timetable/AddSemesterRow';
import { FilterChipRow } from '@/components/timetable/FilterChipRow';
import { FilterModeBar } from '@/components/timetable/FilterModeBar';
import { SemesterRow } from '@/components/timetable/SemesterRow';
import { UNPLACED_LIST_ID, UnplacedCourseRow } from '@/components/timetable/UnplacedCourseRow';
import { categoryIdFromKo } from '@/constants/Categories';
import { subtopicIdFromKo } from '@/constants/Subtopics';
import { DnDProvider, type DragInfo } from '@/hooks/useDnD';
import { type ApiCourse, listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';
import {
  type FilterMode,
  SEMESTERS,
  type TimetableCard,
  UNPLACED_CARDS,
} from '@/lib/mocks/timetableFixture';
import type { CategoryId, SubtopicId } from '@/lib/mocks/types';

type CardLists = Record<string, TimetableCard[]>;

function initialLists(): CardLists {
  return {
    [UNPLACED_LIST_ID]: UNPLACED_CARDS,
    ...Object.fromEntries(SEMESTERS.map((s) => [s.id, s.cards])),
  };
}

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
  const [mode, setMode] = useState<FilterMode>('grade');
  const [gradeChip, setGradeChip] = useState<CategoryId | null>(null);
  const [subjectChip, setSubjectChip] = useState<SubtopicId | null>(null);
  const [lists, setLists] = useState<CardLists>(initialLists);

  const { data: courses, loading, error } = useApi(() => listCourses(), []);

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

  const handleDrop = useCallback(
    (toListId: string, toIndex: number, drag: DragInfo) => {
      setLists((prev) => {
        const fromList = prev[drag.fromListId];
        if (!fromList) return prev;
        const card = fromList.find((c) => c.id === drag.cardId);
        if (!card) return prev;

        const remaining = fromList.filter((c) => c.id !== drag.cardId);

        if (drag.fromListId === toListId) {
          // same-list reorder
          const fromIndex = fromList.findIndex((c) => c.id === drag.cardId);
          // splice 후 인덱스 보정: 같은 list 에서 fromIndex 보다 뒤로 옮길 때는 -1
          const adjusted = fromIndex < toIndex ? toIndex - 1 : toIndex;
          const next = [...remaining];
          next.splice(adjusted, 0, card);
          return { ...prev, [toListId]: next };
        }

        const toNext = [...(prev[toListId] ?? [])];
        toNext.splice(toIndex, 0, card);
        return { ...prev, [drag.fromListId]: remaining, [toListId]: toNext };
      });
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Timetable" onLeftPress={() => router.push('/settings')} />
      <DnDProvider onDrop={handleDrop}>
        <View style={styles.stickyTop}>
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
            {SEMESTERS.map((sem) => (
              <SemesterRow
                key={sem.id}
                semester={sem}
                cards={lists[sem.id] ?? []}
                visibleCards={visibleByList[sem.id] ?? []}
                courseByCode={courseByCode}
              />
            ))}
            <AddSemesterRow />
          </ScrollView>
        )}
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
    fontFamily: 'Georgia',
    color: '#dc2626',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
