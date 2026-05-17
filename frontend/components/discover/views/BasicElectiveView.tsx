import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ChipBox } from '@/components/discover/ChipBox';
import { CourseCard } from '@/components/discover/CourseCard';
import { RootNode } from '@/components/discover/RootNode';
import { TreeCanvas, type TreeEdge, type TreeNode } from '@/components/discover/TreeCanvas';
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
} from '@/components/discover/CategoryTabs';
import { CATEGORIES } from '@/constants/Categories';
import { listCourses } from '@/lib/api/courses';
import { useApi } from '@/lib/api/useApi';

const AREA_COLOR = '#fef9c3';
const LABEL_BG = '#fef08a';
const TREE_MAX_WIDTH = 340;

const ACTIVE_OUTLINE: Record<DiscoverCategoryId, string> = {
  general_elective: '#94a3b8',
  major_elective: '#f59e0b',
  major_required: '#ec4899',
};

type Props = {
  active: DiscoverCategoryId;
  onSelectCategory: (id: DiscoverCategoryId) => void;
};

export function BasicElectiveView({ active, onSelectCategory }: Props) {
  const { data, loading, error } = useApi(
    () => listCourses({ category: '기초선택', includePrerequisites: true }),
    ['basic_elective'],
  );

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [] as TreeNode[], edges: [] as TreeEdge[] };
    const ids = new Set(data.map((c) => c.courseCode));

    const rootNode: TreeNode = {
      id: 'root',
      width: 150,
      height: 30,
      inArea: false,
      render: () => <RootNode courseCode="CS101" courseName="프로그래밍 기초" />,
    };

    const chipNodes: TreeNode[] = DISCOVER_CATEGORIES.map((catId) => ({
      id: `chip_${catId}`,
      width: 70,
      height: 26,
      inArea: false,
      render: () => (
        <ChipBox
          label={CATEGORIES[catId].label_ko}
          active={catId === active}
          outlineColor={ACTIVE_OUTLINE[catId]}
          onPress={() => onSelectCategory(catId)}
        />
      ),
    }));

    const courseNodes: TreeNode[] = data.map((course) => ({
      id: course.courseCode,
      width: 92,
      height: 60,
      inArea: true,
      render: () => <CourseCard course={course} />,
    }));

    const areaLabelNode: TreeNode = {
      id: 'area_label_basic',
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

    dummyEdges.push({ from: 'chip_general_elective', to: 'area_label_basic' });

    const innerRoots = data.filter((c) =>
      c.prerequisites.every((p) => !ids.has(p)),
    );
    innerRoots.forEach((c) => {
      dummyEdges.push({ from: 'area_label_basic', to: c.courseCode, invisible: true });
    });

    const prereqEdges: TreeEdge[] = [];
    data.forEach((course) => {
      course.prerequisites.forEach((prereq) => {
        if (ids.has(prereq)) prereqEdges.push({ from: prereq, to: course.courseCode });
      });
    });

    return { nodes: treeNodes, edges: [...dummyEdges, ...prereqEdges] };
  }, [data, active, onSelectCategory]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return <Text style={styles.error}>{error.message}</Text>;
  }
  return (
    <View style={styles.center}>
      <TreeCanvas
        nodes={nodes}
        edges={edges}
        maxWidth={TREE_MAX_WIDTH}
        areaBox={{
          color: AREA_COLOR,
          label: '기초 선택 과목',
          labelBg: LABEL_BG,
          labelTextColor: '#713f12',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  error: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#dc2626',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
