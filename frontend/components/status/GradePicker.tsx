import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ApiRoadmapGrade } from '@/lib/api/roadmap';

type Props = {
  courseCode: string;
  selectedGrade: ApiRoadmapGrade;
  onSelect: (grade: ApiRoadmapGrade) => void;
  onClose: () => void;
};

// 표시 순서. PLANNED → KAIST 4.3 scale → S/U/R.
const GRADE_OPTIONS: { value: ApiRoadmapGrade; label: string; point?: number }[] = [
  { value: 'PLANNED', label: 'Not Taken' },
  { value: 'A+', label: 'A+', point: 4.3 },
  { value: 'A0', label: 'A0', point: 4.0 },
  { value: 'A-', label: 'A-', point: 3.7 },
  { value: 'B+', label: 'B+', point: 3.3 },
  { value: 'B0', label: 'B0', point: 3.0 },
  { value: 'B-', label: 'B-', point: 2.7 },
  { value: 'C+', label: 'C+', point: 2.3 },
  { value: 'C0', label: 'C0', point: 2.0 },
  { value: 'C-', label: 'C-', point: 1.7 },
  { value: 'D+', label: 'D+', point: 1.3 },
  { value: 'D0', label: 'D0', point: 1.0 },
  { value: 'D-', label: 'D-', point: 0.7 },
  { value: 'F', label: 'F', point: 0.0 },
  { value: 'S', label: 'S (Pass)' },
  { value: 'U', label: 'U (Fail, no GPA)' },
  { value: 'R', label: 'R (Retake, excluded)' },
];

export function GradePicker({ courseCode, selectedGrade, onSelect, onClose }: Props) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerCode}>{courseCode}</Text>
          <Text style={styles.headerLabel}>Set grade</Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
          {GRADE_OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === selectedGrade;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={[styles.row, idx > 0 && styles.rowDivider, isSelected && styles.rowActive]}
              >
                <Text style={[styles.label, isSelected && styles.labelActive]}>
                  {opt.label}
                </Text>
                {opt.point !== undefined ? (
                  <Text style={[styles.point, isSelected && styles.labelActive]}>
                    {opt.point.toFixed(1)}
                  </Text>
                ) : (
                  <View style={styles.checkSlot}>
                    {isSelected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 260,
    maxHeight: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.18)' } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 2,
  },
  headerCode: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#111',
  },
  headerLabel: {
    fontFamily: 'Georgia',
    fontSize: 11,
    color: '#6b7280',
  },
  list: {
    maxHeight: 360,
  },
  listInner: {
    paddingVertical: 4,
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
    borderTopColor: '#f3f4f6',
  },
  rowActive: {
    backgroundColor: '#a78bfa',
  },
  label: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#111',
  },
  labelActive: {
    color: '#fff',
  },
  point: {
    fontFamily: 'Georgia',
    fontSize: 12,
    color: '#6b7280',
  },
  checkSlot: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
