import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '@/constants/Categories';
import type { CategoryId } from '@/lib/mocks/types';

// Figure 15 의 2×2 grid 순서 그대로
const VISIBLE_IDS: CategoryId[] = [
  'general_required',
  'general_elective',
  'major_elective',
  'major_required',
];

type Props = {
  active: CategoryId | null;
  onSelect: (id: CategoryId | null) => void;
};

export function CategoryButtons({ active, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {VISIBLE_IDS.map((id) => {
        const cat = CATEGORIES[id];
        const isActive = id === active;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(isActive ? null : id)}
            style={[
              styles.chip,
              { backgroundColor: cat.chipColor },
              isActive && styles.chipActive,
            ]}
          >
            <Text style={styles.chipText}>{cat.label_ko}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  chip: {
    flexBasis: '47%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: '#7c3aed',
  },
  chipText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    color: '#111',
  },
});
