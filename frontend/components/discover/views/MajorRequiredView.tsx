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
import { useLocale } from '@/lib/locale/LocaleContext';

const AREA_COLOR = '#d1fae5';
const LABEL_BG = '#bbf7d0';
const KEY_AREA_COLOR = '#a07a48';
const KEY_LABEL_BG = '#7c4a1a';
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

export function MajorRequiredView({ active, onSelectCategory }: Props) {
  const { t, pick } = useLocale();
  const { data, loading, error } = useApi(
    () => listCourses({ category: '전공필수', includePrerequisites: true }),
    ['major_required'],
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
      subAreaId: course.matched && course.isKeyCourse ? 'key' : undefined,
      selectable: true,
      render: () => <CourseCard course={course} />,
    }));

    // 영역 박스 라벨 위치용 invisible 노드 — chip → 영역 박스 화살표 끝점
    const areaLabelNode: TreeNode = {
      id: 'area_label_inner',
      width: 88,
      height: 22,
      inArea: false,
      pinTo: 'area_top',
      render: () => null,
    };

    const treeNodes: TreeNode[] = [rootNode, ...chipNodes, areaLabelNode, ...courseNodes];

    // dummy edges: root → 3 chips
    const dummyEdges: TreeEdge[] = DISCOVER_CATEGORIES.map((catId) => ({
      from: 'root',
      to: `chip_${catId}`,
    }));

    // major_elective chip → outer (matched=false) 노드들
    const outerCourses = data.filter((c) => !c.matched);
    outerCourses.forEach((c) => {
      dummyEdges.push({ from: 'chip_major_elective', to: c.courseCode });
    });

    // 활성 chip(major_required) → 영역 박스 라벨로 1 화살표만 visible
    dummyEdges.push({ from: 'chip_major_required', to: 'area_label_inner' });

    // area_label → inner roots invisible (layout 강제용)
    const innerRoots = data.filter(
      (c) =>
        c.matched &&
        !c.isKeyCourse &&
        c.prerequisites.every(
          (p) => !data.find((c2) => c2.courseCode === p)?.matched,
        ),
    );
    innerRoots.forEach((c) => {
      dummyEdges.push({ from: 'area_label_inner', to: c.courseCode, invisible: true });
    });

    // outer → area_label invisible: outer가 영역 박스 위쪽 rank로
    outerCourses.forEach((o) => {
      dummyEdges.push({ from: o.courseCode, to: 'area_label_inner', invisible: true });
    });

    // 실제 prereq edges (양쪽 matched=true 또는 prereq from outer/inner)
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
          label: t('전공 필수 과목', 'Major Required Courses'),
          labelBg: LABEL_BG,
          labelTextColor: '#065f46',
        }}
        subAreas={[
          {
            id: 'key',
            color: KEY_AREA_COLOR,
            label: t('주요 과목', 'Key Courses'),
            labelBg: KEY_LABEL_BG,
            labelTextColor: '#fff',
          },
        ]}
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#dc2626',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
