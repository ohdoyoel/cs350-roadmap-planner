import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChipBox } from '@/components/discover/ChipBox';
import { RootNode } from '@/components/discover/RootNode';
import { SectorChipGrid } from '@/components/discover/SectorChipGrid';
import { TreeCanvas, type TreeEdge, type TreeNode } from '@/components/discover/TreeCanvas';
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
} from '@/components/discover/CategoryTabs';
import { CATEGORIES } from '@/constants/Categories';
import type { SubtopicId } from '@/lib/mocks/types';

const TREE_MAX_WIDTH = 340;

const ACTIVE_OUTLINE: Record<DiscoverCategoryId, string> = {
  general_elective: '#94a3b8',
  major_elective: '#f59e0b',
  major_required: '#ec4899',
};

type Props = {
  active: DiscoverCategoryId;
  onSelectCategory: (id: DiscoverCategoryId) => void;
  onSelectSector: (id: SubtopicId) => void;
};

export function MajorElectiveDefaultView({ active, onSelectCategory, onSelectSector }: Props) {
  const { nodes, edges } = useMemo(() => {
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
    const treeEdges: TreeEdge[] = DISCOVER_CATEGORIES.map((catId) => ({
      from: 'root',
      to: `chip_${catId}`,
    }));
    return { nodes: [rootNode, ...chipNodes], edges: treeEdges };
  }, [active, onSelectCategory]);

  return (
    <View style={styles.wrapper}>
      <TreeCanvas nodes={nodes} edges={edges} maxWidth={TREE_MAX_WIDTH} />
      <SectorChipGrid onSelectSector={onSelectSector} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
});
