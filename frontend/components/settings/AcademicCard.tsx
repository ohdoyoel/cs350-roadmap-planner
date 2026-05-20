import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { ACADEMIC_TRACK_OPTIONS } from '@/lib/mocks/settingsFixture';
import type { AcademicTrack } from '@/lib/mocks/types';

type Props = {
  selected: AcademicTrack;
  onPress: () => void;
};

export function AcademicCard({ selected, onPress }: Props) {
  const opt = ACADEMIC_TRACK_OPTIONS.find((o) => o.id === selected) ?? ACADEMIC_TRACK_OPTIONS[0];
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Academic Settings</Text>
      <Pressable onPress={onPress} style={styles.pill} accessibilityRole="button">
        <Text style={styles.pillText}>{opt.label_en}</Text>
        <DiamondIcon size={10} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#e3d5fc',
    borderRadius: 18,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#111',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#374151',
  },
});
