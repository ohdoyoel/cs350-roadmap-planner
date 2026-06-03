import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChipBox } from '@/components/discover/ChipBox';
import { CourseCard } from '@/components/discover/CourseCard';
import { RootNode } from '@/components/discover/RootNode';
import { TreeCanvas, type TreeEdge, type TreeNode } from '@/components/discover/TreeCanvas';
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
} from '@/components/discover/CategoryTabs';
import { CATEGORIES } from '@/constants/Categories';
import { SUBTOPICS } from '@/constants/Subtopics';
import { listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SubtopicId } from '@/lib/mocks/types';

const TREE_MAX_WIDTH = 340;

const ACTIVE_OUTLINE: Record<DiscoverCategoryId, string> = {
  general_elective: '#94a3b8',
  major_elective: '#f59e0b',
  major_required: '#ec4899',
};

type Props = {
  subtopicId: SubtopicId;
  active: DiscoverCategoryId;
  onSelectCategory: (id: DiscoverCategoryId) => void;
  onBack: () => void;
};

export function MajorElectiveSectorView({ subtopicId, active, onSelectCategory, onBack }: Props) {
  const token = SUBTOPICS[subtopicId];
  const { t, pick } = useLocale();

  const { data, loading, error } = useApi(
    () => listCourses({ sector: token.label_ko, includePrerequisites: true }),
    ['sector', subtopicId],
  );

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [] as TreeNode[], edges: [] as TreeEdge[] };
    const ids = new Set(data.map((c) => c.courseCode));

    const rootNode: TreeNode = {
      id: 'root',
      width: 150,
      height: 30,
      inArea: false,
      render: () => (
        <RootNode courseCode="CS101" courseName={t('프로그래밍 기초', 'Programming Basics')} />
      ),
    };

    const chipNodes: TreeNode[] = DISCOVER_CATEGORIES.map((catId) => ({
      id: `chip_${catId}`,
      width: 96,
      height: 26,
      inArea: false,
      render: () => (
        <ChipBox
          label={pick({ ko: CATEGORIES[catId].label_ko, en: CATEGORIES[catId].label_en })}
          active={catId === active}
          outlineColor={ACTIVE_OUTLINE[catId]}
          onPress={() => onSelectCategory(catId)}
        />
      ),
    }));

    const courseNodes: TreeNode[] = data.map((course) => ({
      id: course.courseCode,
      width: 92,
      height: 82,
      inArea: course.matched,
      selectable: true,
      render: () => <CourseCard course={course} />,
    }));

    const outerCourses = data.filter((c) => !c.matched);

    const areaLabelNode: TreeNode = {
      id: 'area_label_sector',
      width: 88,
      height: 22,
      inArea: false,
      pinTo: 'area_top',
      render: () => null,
    };

    const treeNodes: TreeNode[] = [rootNode, ...chipNodes, areaLabelNode, ...courseNodes];

    const dummyEdges: TreeEdge[] = DISCOVER_CATEGORIES.map((catId) => ({
      from: 'root',
      to: `chip_${catId}`,
    }));

    outerCourses.forEach((c) => {
      dummyEdges.push({ from: 'chip_major_elective', to: c.courseCode });
    });

    dummyEdges.push({ from: 'chip_major_elective', to: 'area_label_sector' });

    const innerRoots = data.filter(
      (c) =>
        c.matched &&
        c.prerequisites.every(
          (p) => !data.find((c2) => c2.courseCode === p)?.matched,
        ),
    );
    innerRoots.forEach((c) => {
      dummyEdges.push({ from: 'area_label_sector', to: c.courseCode, invisible: true });
    });

    outerCourses.forEach((o) => {
      dummyEdges.push({ from: o.courseCode, to: 'area_label_sector', invisible: true });
    });

    const prereqEdges: TreeEdge[] = [];
    data.forEach((course) => {
      course.prerequisites.forEach((prereq) => {
        if (ids.has(prereq)) prereqEdges.push({ from: prereq, to: course.courseCode });
      });
    });

    return { nodes: treeNodes, edges: [...dummyEdges, ...prereqEdges] };
  }, [data, active, onSelectCategory, t, pick]);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.error}>{error.message}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrapper}>
      <TreeCanvas
        nodes={nodes}
        edges={edges}
        maxWidth={TREE_MAX_WIDTH}
        areaBox={{
          color: token.bgColor,
          label: pick({ ko: token.label_ko, en: token.label_en }),
          labelBg: token.dotColor,
          labelTextColor: '#fff',
        }}
      />
      <Pressable onPress={onBack} style={styles.backLink} accessibilityRole="button">
        <Text style={styles.backText}>{t('← 분야 선택으로 돌아가기', '← Back to sectors')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  backLink: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  error: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#dc2626',
    textAlign: 'center',
  },
});
