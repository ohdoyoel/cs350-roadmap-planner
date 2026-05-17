import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '@/constants/Categories';
import type { CategoryId } from '@/lib/mocks/types';

export type DiscoverCategoryId = Extract<
  CategoryId,
  'general_elective' | 'major_required' | 'major_elective'
>;

export const DISCOVER_CATEGORIES: DiscoverCategoryId[] = [
  'general_elective',
  'major_elective',
  'major_required',
];

// SRS Figure 5의 활성 chip outline 색
const ACTIVE_OUTLINE: Record<DiscoverCategoryId, string> = {
  general_elective: '#94a3b8',
  major_elective: '#f59e0b',
  major_required: '#ec4899',
};

type Props = {
  active: DiscoverCategoryId;
  onSelect: (id: DiscoverCategoryId) => void;
};

export function CategoryTabs({ active, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {DISCOVER_CATEGORIES.map((id) => {
        const token = CATEGORIES[id];
        const isActive = id === active;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            style={[
              styles.chip,
              {
                borderColor: isActive ? ACTIVE_OUTLINE[id] : '#e5e7eb',
                borderWidth: isActive ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.label}>{token.label_ko}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#111',
  },
});
