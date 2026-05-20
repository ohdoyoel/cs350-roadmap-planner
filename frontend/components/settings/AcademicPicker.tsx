import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACADEMIC_TRACK_OPTIONS } from '@/lib/mocks/settingsFixture';
import type { AcademicTrack } from '@/lib/mocks/types';

type Props = {
  selectedId: AcademicTrack;
  onSelect: (id: AcademicTrack) => void;
  onClose: () => void;
};

export function AcademicPicker({ selectedId, onSelect, onClose }: Props) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.panel}>
        {ACADEMIC_TRACK_OPTIONS.map((opt, idx) => {
          const isSelected = opt.id === selectedId;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              style={[styles.row, idx > 0 && styles.rowDivider]}
            >
              <Text style={styles.label}>{opt.label_en}</Text>
              {isSelected ? (
                <Ionicons name="checkmark" size={16} color="#374151" />
              ) : (
                <View style={styles.checkPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 280,
    alignSelf: 'center',
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
      } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#111',
  },
  checkPlaceholder: {
    width: 16,
    height: 16,
  },
});
