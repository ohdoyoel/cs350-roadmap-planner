import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { type DiscoverCategoryId } from '@/components/discover/CategoryTabs';
import { MiniStatus, type MiniStatusItem } from '@/components/discover/MiniStatus';
import { BasicElectiveView } from '@/components/discover/views/BasicElectiveView';
import { MajorElectiveDefaultView } from '@/components/discover/views/MajorElectiveDefaultView';
import { MajorElectiveSectorView } from '@/components/discover/views/MajorElectiveSectorView';
import { MajorRequiredView } from '@/components/discover/views/MajorRequiredView';
import { categoryIdFromKo } from '@/constants/Categories';
import { subtopicIdFromKo } from '@/constants/Subtopics';
import { useFocus } from '@/lib/discover/FocusContext';
import type { SubtopicId } from '@/lib/mocks/types';

// SRS Figure 4 좌상단 mini status. user state 도입 전까지 SRS 값 그대로 표시.
const MINI_STATUS: MiniStatusItem[] = [
  { label: '기초 선택', earned: 3, total: 9 },
  { label: '전공 필수', earned: 9, total: 19 },
  { label: '전공 선택', earned: 12, total: 30 },
];

export default function Discover() {
  const [active, setActive] = useState<DiscoverCategoryId>('major_required');
  const [sectorId, setSectorId] = useState<SubtopicId | null>(null);
  const { focus } = useFocus();

  // 카테고리 바뀌면 sector 선택 리셋
  useEffect(() => {
    if (active !== 'major_elective') setSectorId(null);
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
    } else {
      setActive('general_elective');
    }
  }, [focus]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Discover" onLeftPress={() => router.push('/settings')} />
      <View style={styles.statusRow}>
        <MiniStatus items={MINI_STATUS} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ActiveCategoryView
          active={active}
          sectorId={sectorId}
          onSelectSector={setSectorId}
          onBackToSectors={() => setSectorId(null)}
          onSelectCategory={setActive}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ActiveProps = {
  active: DiscoverCategoryId;
  sectorId: SubtopicId | null;
  onSelectSector: (id: SubtopicId) => void;
  onBackToSectors: () => void;
  onSelectCategory: (id: DiscoverCategoryId) => void;
};

function ActiveCategoryView({
  active,
  sectorId,
  onSelectSector,
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
  if (!sectorId) {
    return (
      <MajorElectiveDefaultView
        active={active}
        onSelectCategory={onSelectCategory}
        onSelectSector={onSelectSector}
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
