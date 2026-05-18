import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CategoryButtons } from '@/components/sidebar/CategoryButtons';
import { CourseDetailPanel } from '@/components/sidebar/CourseDetailPanel';
import { CourseResultCard } from '@/components/sidebar/CourseResultCard';
import { SearchInput } from '@/components/sidebar/SearchInput';
import { SectorList } from '@/components/sidebar/SectorList';
import { CATEGORIES } from '@/constants/Categories';
import { SUBTOPICS } from '@/constants/Subtopics';
import { type ApiCourse, listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';
import { useFocus } from '@/lib/discover/FocusContext';
import type { CategoryId, SubtopicId } from '@/lib/mocks/types';
import { useSidebar } from '@/lib/sidebar/SidebarContext';
import { useCart } from '@/lib/timetable/CartContext';

const PANEL_WIDTH = 400;
const ANIM_DURATION = 220;

// AppHeader 영역(상단)과 CustomTabBar 영역(하단) 이 보이도록 패널 inset.
const TOP_INSET = 72;
const BOTTOM_INSET = 96;

export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();
  const { setFocus } = useFocus();
  const { addToCart } = useCart();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicId | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);

  const translateX = useSharedValue(PANEL_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : PANEL_WIDTH, { duration: ANIM_DURATION });
    if (!isOpen) {
      setSearchText('');
      setSelectedCategory(null);
      setSelectedSubtopic(null);
      setSelectedCourse(null);
    }
  }, [isOpen, translateX]);

  const panelStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: translateX.value }] }),
    [translateX],
  );

  const trimmed = searchText.trim();
  const hasFilter = trimmed.length > 0 || !!selectedCategory || !!selectedSubtopic;

  const { data: results, loading } = useApi(
    () =>
      listCourses({
        q: trimmed || undefined,
        category: selectedCategory ? CATEGORIES[selectedCategory].label_ko : undefined,
        sector: selectedSubtopic ? SUBTOPICS[selectedSubtopic].label_ko : undefined,
      }),
    [trimmed, selectedCategory, selectedSubtopic, isOpen],
  );

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      {/* 헤더/탭 영역 등 패널 바깥을 누르면 닫힘 */}
      <Pressable
        onPress={close}
        style={StyleSheet.absoluteFill}
        accessibilityLabel="Close sidebar"
      />
      <Animated.View style={[styles.panel, panelStyle]}>
        <View style={styles.searchWrap}>
          <SearchInput value={searchText} onChange={setSearchText} />
        </View>
        {hasFilter ? (
          <ScrollView contentContainerStyle={styles.results}>
            {selectedSubtopic ? (
              <SectorHeader id={selectedSubtopic} onClear={() => setSelectedSubtopic(null)} />
            ) : null}
            {selectedCategory ? (
              <CategoryHeader id={selectedCategory} onClear={() => setSelectedCategory(null)} />
            ) : null}
            {!loading && (results ?? []).length === 0 ? (
              <Text style={styles.empty}>일치하는 과목이 없습니다.</Text>
            ) : null}
            {(results ?? []).map((c) => (
              <CourseResultCard
                key={c.courseCode}
                course={c}
                onPress={() => setSelectedCourse(c)}
              />
            ))}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <CategoryButtons active={selectedCategory} onSelect={setSelectedCategory} />
            <SectorList active={selectedSubtopic} onSelect={setSelectedSubtopic} />
          </ScrollView>
        )}
      </Animated.View>
      {selectedCourse ? (
        <View style={styles.detailWrap}>
          <CourseDetailPanel
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onAddToPlanned={() => {
              addToCart(selectedCourse.courseCode);
              setSelectedCourse(null);
              close();
              router.push('/timetable');
            }}
            onFindInTree={() => {
              setFocus(selectedCourse);
              setSelectedCourse(null);
              close();
              router.push('/');
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function SectorHeader({ id, onClear }: { id: SubtopicId; onClear: () => void }) {
  const t = SUBTOPICS[id];
  return (
    <Pressable onPress={onClear} style={[styles.headerChip, { backgroundColor: t.bgColor }]}>
      <Text style={styles.headerLabel}>{t.label_ko}</Text>
      <View style={[styles.headerDot, { backgroundColor: t.dotColor }]} />
    </Pressable>
  );
}

function CategoryHeader({ id, onClear }: { id: CategoryId; onClear: () => void }) {
  const c = CATEGORIES[id];
  return (
    <Pressable onPress={onClear} style={[styles.headerChip, { backgroundColor: c.chipColor }]}>
      <Text style={styles.headerLabel}>{c.label_ko}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: TOP_INSET,
    right: 0,
    bottom: BOTTOM_INSET,
    width: PANEL_WIDTH,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },
  results: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  empty: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#6b7280',
    paddingVertical: 16,
    textAlign: 'center',
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  headerLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#111',
    fontWeight: '600',
  },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  detailWrap: {
    position: 'absolute',
    top: TOP_INSET + 8,
    left: 12,
    right: 12,
    bottom: BOTTOM_INSET + 8,
  },
});
