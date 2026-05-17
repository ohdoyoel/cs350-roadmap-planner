import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SUBTOPICS, SUBTOPIC_ORDER } from '@/constants/Subtopics';
import type { SubtopicId } from '@/lib/mocks/types';

type Props = {
  active: SubtopicId | null;
  onSelect: (id: SubtopicId | null) => void;
};

export function SectorList({ active, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>과목 분류</Text>
      </View>
      <View style={styles.list}>
        {SUBTOPIC_ORDER.map((id) => {
          const sub = SUBTOPICS[id];
          const isActive = id === active;
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(isActive ? null : id)}
              style={[styles.row, isActive && styles.rowActive]}
            >
              <Text style={styles.label}>{sub.label_ko}</Text>
              <View style={[styles.dot, { backgroundColor: sub.dotColor }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  headerRow: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  header: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  list: { gap: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowActive: {
    borderColor: '#7c3aed',
    borderWidth: 1.5,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#111',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
