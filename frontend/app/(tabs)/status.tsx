import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChipRow } from '@/components/status/CategoryChipRow';
import { CourseListItem } from '@/components/status/CourseListItem';
import { CustomCourseForm } from '@/components/status/CustomCourseForm';
import { GradePicker } from '@/components/status/GradePicker';
import { RequirementProgressList } from '@/components/status/RequirementProgressList';
import { SemesterPicker } from '@/components/status/SemesterPicker';
import { SemesterTitle } from '@/components/status/SemesterTitle';
import { StatTileGrid } from '@/components/status/StatTileGrid';
import { getMyCreditGpa } from '@/lib/api/creditGpa';
import type { ApiRoadmapGrade } from '@/lib/api/roadmap';
import { useApi } from '@/lib/api/useApi';
import { useLocale } from '@/lib/locale/LocaleContext';
import { type CourseListEntry, type FilterChipId } from '@/lib/mocks/statusFixture';
import type { CategoryId } from '@/lib/mocks/types';
import {
  mapCourseEntries,
  mapRequirementGroups,
  mapStatSummary,
} from '@/lib/status/mapping';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCart } from '@/lib/timetable/CartContext';

// 'Others' 칩이 묶어 보여줄 카테고리 집합.
const OTHERS_CATEGORIES = new Set<CategoryId>([
  'general_required',
  'general_elective',
  'other',
]);

export default function Status() {
  const { tokens } = useTheme();
  const { t, locale } = useLocale();
  const {
    setCurrentSemester: setRoadmapCurrentSemester,
    setCourseGrade,
    addCustomCourse,
    roadmapVersion,
    semesters: cartSemesters,
  } = useCart();
  const [activeChip, setActiveChip] = useState<FilterChipId>('all');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [gradeTarget, setGradeTarget] = useState<CourseListEntry | null>(null);
  const [customFormOpen, setCustomFormOpen] = useState(false);

  // 탭이 다시 focus 될 때마다 /credit-gpa/me 를 refetch.
  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
    }, []),
  );

  const { data: creditGpa, loading, error } = useApi(
    () => getMyCreditGpa(),
    [roadmapVersion, focusTick],
  );

  const summary = useMemo(() => (creditGpa ? mapStatSummary(creditGpa) : null), [creditGpa]);
  const groups = useMemo(
    () => (creditGpa ? mapRequirementGroups(creditGpa) : []),
    [creditGpa],
  );
  const entries = useMemo(
    () => (creditGpa ? mapCourseEntries(creditGpa) : []),
    [creditGpa],
  );
  const semesterOptions = useMemo(
    () =>
      cartSemesters.map((s) => ({
        id: s.id,
        label: locale === 'ko' ? s.label_ko : s.label_en,
      })),
    [cartSemesters, locale],
  );
  const currentSemesterId = creditGpa?.currentSemester ?? '1-1';
  const semester =
    semesterOptions.find((opt) => opt.id === currentSemesterId) ?? semesterOptions[0];

  const visibleEntries = useMemo(() => {
    if (activeChip === 'all') return entries;
    if (activeChip === 'custom') return entries.filter((e) => !e.category);
    if (activeChip === 'general_elective') {
      return entries.filter((e) => e.category && OTHERS_CATEGORIES.has(e.category));
    }
    return entries.filter((e) => e.category === activeChip);
  }, [activeChip, entries]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top']}>
      <AppHeader>
        <View style={styles.headerStack}>
          <Text style={[styles.headerTitle, { color: tokens.text }]}>Status</Text>
          {semester ? (
            <SemesterTitle label={semester.label} onPress={() => setPickerOpen((v) => !v)} />
          ) : null}
        </View>
      </AppHeader>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading || !summary ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.errorText}>{error.message}</Text>
        ) : (
          <>
            <StatTileGrid summary={summary} />
            <Text style={[styles.sectionLabel, { color: tokens.text }]}>{t('이수 요건 진행도', 'Requirement Progress')}</Text>
            <RequirementProgressList groups={groups} />
            <CategoryChipRow active={activeChip} onSelect={setActiveChip} />
            <View style={styles.listHeader}>
              <Text style={[styles.sectionLabel, { color: tokens.text }]}>{t('상세 과목 목록', 'Detailed Course List')}</Text>
              {activeChip === 'custom' ? (
                <Pressable
                  onPress={() => setCustomFormOpen(true)}
                  style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={t('커스텀 과목 추가', 'Add custom course')}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text style={styles.addBtnText}>{t('추가', 'Add')}</Text>
                </Pressable>
              ) : null}
            </View>
            <View>
              {visibleEntries.length === 0 ? (
                <Text style={styles.emptyText}>
                  {t('해당 카테고리의 과목이 없습니다.', 'No courses in this category.')}
                </Text>
              ) : (
                visibleEntries.map((entry) => (
                  <CourseListItem
                    key={`${entry.semester}-${entry.code}`}
                    entry={entry}
                    onPress={setGradeTarget}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
      {pickerOpen && semester ? (
        <SemesterPicker
          options={semesterOptions}
          selectedId={semester.id}
          onSelect={(id) => {
            setPickerOpen(false);
            void setRoadmapCurrentSemester(id);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
      {gradeTarget ? (
        <GradePicker
          courseCode={`${gradeTarget.code} · ${gradeTarget.semester}`}
          selectedGrade={gradeTarget.rawGrade as ApiRoadmapGrade}
          onSelect={(grade) => {
            const target = gradeTarget;
            setGradeTarget(null);
            void setCourseGrade(target.semester, target.code, grade);
          }}
          onClose={() => setGradeTarget(null)}
        />
      ) : null}
      {customFormOpen ? (
        <CustomCourseForm
          semesters={semesterOptions}
          defaultSemester={semester?.id ?? '1-1'}
          onSubmit={addCustomCourse}
          onClose={() => setCustomFormOpen(false)}
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#1f2937',
    marginTop: 4,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addBtnPressed: {
    backgroundColor: '#374151',
  },
  addBtnText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
    color: '#fff',
  },
  headerStack: {
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111',
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#dc2626',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#6b7280',
    paddingVertical: 12,
  },
});
