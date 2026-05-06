import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChipRow } from '@/components/status/CategoryChipRow';
import { CourseListItem } from '@/components/status/CourseListItem';
import { RequirementProgressList } from '@/components/status/RequirementProgressList';
import { SemesterPicker } from '@/components/status/SemesterPicker';
import { SemesterTitle } from '@/components/status/SemesterTitle';
import { StatTileGrid } from '@/components/status/StatTileGrid';
import {
  COURSE_LIST,
  CURRENT_SEMESTER_ID,
  type FilterChipId,
  REQUIREMENT_GROUPS,
  SEMESTER_OPTIONS,
  STAT_SUMMARY,
} from '@/lib/mocks/statusFixture';

export default function Status() {
  const [activeChip, setActiveChip] = useState<FilterChipId>('all');
  const [semesterId, setSemesterId] = useState(CURRENT_SEMESTER_ID);
  const [pickerOpen, setPickerOpen] = useState(false);

  const semester = useMemo(
    () => SEMESTER_OPTIONS.find((s) => s.id === semesterId) ?? SEMESTER_OPTIONS[0],
    [semesterId],
  );

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
        <View>
          {COURSE_LIST.map((entry) => (
            <CourseListItem key={entry.code} entry={entry} />
          ))}
        </View>
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
});
