import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { type DiscoverCategoryId } from '@/components/discover/CategoryTabs';
import { MiniStatus, type MiniStatusItem } from '@/components/discover/MiniStatus';
import { BasicElectiveView } from '@/components/discover/views/BasicElectiveView';
import { MajorElectiveDefaultView } from '@/components/discover/views/MajorElectiveDefaultView';
import { MajorElectiveKeyView } from '@/components/discover/views/MajorElectiveKeyView';
import { MajorElectiveSectorView } from '@/components/discover/views/MajorElectiveSectorView';
import { MajorRequiredView } from '@/components/discover/views/MajorRequiredView';
import { categoryIdFromKo } from '@/constants/Categories';
import { subtopicIdFromKo } from '@/constants/Subtopics';
import { getMyCreditGpa } from '@/lib/api/creditGpa';
import { useApi } from '@/lib/api/useApi';
import { useFocus } from '@/lib/discover/FocusContext';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SubtopicId } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCart } from '@/lib/timetable/CartContext';

export default function Discover() {
  const { tokens } = useTheme();
  const { t } = useLocale();
  const { roadmapVersion } = useCart();
  const [active, setActive] = useState<DiscoverCategoryId>('major_required');
  const [sectorId, setSectorId] = useState<SubtopicId | null>(null);
  const [keyCoursesOpen, setKeyCoursesOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const { focus } = useFocus();

  // 탭이 다시 focus 될 때마다 /credit-gpa/me refetch — 학기 변경/과목 추가 반영.
  useFocusEffect(
    useCallback(() => {
      setFocusTick((tick) => tick + 1);
    }, []),
  );

  const { data: creditGpa } = useApi(() => getMyCreditGpa(), [roadmapVersion, focusTick]);

  const miniStatus = useMemo<MiniStatusItem[]>(() => {
    const labelByKey: Record<string, string> = {
      basic: t('기초 선택', 'Basic Elective'),
      major_required: t('전공 필수', 'Major Required'),
      major_elective: t('전공 선택', 'Major Elective'),
    };
    const order = ['basic', 'major_required', 'major_elective'] as const;
    if (!creditGpa) {
      return order.map((key) => ({ label: labelByKey[key], earned: 0, total: 0 }));
    }
    const byKey = new Map(creditGpa.requirements.map((r) => [r.key, r]));
    return order
      .map((key) => {
        const r = byKey.get(key);
        if (!r) return null;
        return { label: labelByKey[key], earned: r.completedCredits, total: r.requiredCredits };
      })
      .filter((item): item is MiniStatusItem => item !== null);
  }, [creditGpa, t]);

  // 카테고리 바뀌면 sub-page 선택 리셋
  useEffect(() => {
    if (active !== 'major_elective') {
      setSectorId(null);
      setKeyCoursesOpen(false);
    }
  }, [active]);

  // 사이드바에서 '트리에서 찾기' 누르면 해당 과목 카테고리/sector 로 점프.
  useEffect(() => {
    if (!focus) return;
    const catId = categoryIdFromKo(focus.category);
    if (catId === 'major_required') {
      setActive('major_required');
    } else if (catId === 'major_elective') {
      setActive('major_elective');
      const sid = focus.sector ? subtopicIdFromKo(focus.sector) : null;
      setSectorId(sid ?? null);
      setKeyCoursesOpen(false);
    } else {
      setActive('general_elective');
    }
  }, [focus]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top']}>
      <AppHeader title="Discover" />
      <View style={styles.statusRow}>
        <MiniStatus items={miniStatus} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ActiveCategoryView
          active={active}
          sectorId={sectorId}
          keyCoursesOpen={keyCoursesOpen}
          onSelectSector={(id) => {
            setSectorId(id);
            setKeyCoursesOpen(false);
          }}
          onSelectKeyCourses={() => {
            setKeyCoursesOpen(true);
            setSectorId(null);
          }}
          onBackToSectors={() => {
            setSectorId(null);
            setKeyCoursesOpen(false);
          }}
          onSelectCategory={setActive}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ActiveProps = {
  active: DiscoverCategoryId;
  sectorId: SubtopicId | null;
  keyCoursesOpen: boolean;
  onSelectSector: (id: SubtopicId) => void;
  onSelectKeyCourses: () => void;
  onBackToSectors: () => void;
  onSelectCategory: (id: DiscoverCategoryId) => void;
};

function ActiveCategoryView({
  active,
  sectorId,
  keyCoursesOpen,
  onSelectSector,
  onSelectKeyCourses,
  onBackToSectors,
  onSelectCategory,
}: ActiveProps) {
  if (active === 'general_elective') {
    return <BasicElectiveView active={active} onSelectCategory={onSelectCategory} />;
  }
  if (active === 'major_required') {
    return <MajorRequiredView active={active} onSelectCategory={onSelectCategory} />;
  }
  // major_elective
  if (keyCoursesOpen) {
    return (
      <MajorElectiveKeyView
        active={active}
        onSelectCategory={onSelectCategory}
        onBack={onBackToSectors}
      />
    );
  }
  if (!sectorId) {
    return (
      <MajorElectiveDefaultView
        active={active}
        onSelectCategory={onSelectCategory}
        onSelectSector={onSelectSector}
        onSelectKeyCourses={onSelectKeyCourses}
      />
    );
  }
  return (
    <MajorElectiveSectorView
      subtopicId={sectorId}
      active={active}
      onSelectCategory={onSelectCategory}
      onBack={onBackToSectors}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  statusRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 14,
  },
});
