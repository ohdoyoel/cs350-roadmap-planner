import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ApiRoadmapGrade } from '@/lib/api/roadmap';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  courseCode: string;
  selectedGrade: ApiRoadmapGrade;
  onSelect: (grade: ApiRoadmapGrade) => void;
  onClose: () => void;
};

// 표시 순서. PLANNED → KAIST 4.3 scale → S/U/R.
const GRADE_OPTIONS: { value: ApiRoadmapGrade; label_ko: string; label_en: string; point?: number }[] = [
  { value: 'PLANNED', label_ko: '미수강', label_en: 'Not Taken' },
  { value: 'A+', label_ko: 'A+', label_en: 'A+', point: 4.3 },
  { value: 'A0', label_ko: 'A0', label_en: 'A0', point: 4.0 },
  { value: 'A-', label_ko: 'A-', label_en: 'A-', point: 3.7 },
  { value: 'B+', label_ko: 'B+', label_en: 'B+', point: 3.3 },
  { value: 'B0', label_ko: 'B0', label_en: 'B0', point: 3.0 },
  { value: 'B-', label_ko: 'B-', label_en: 'B-', point: 2.7 },
  { value: 'C+', label_ko: 'C+', label_en: 'C+', point: 2.3 },
  { value: 'C0', label_ko: 'C0', label_en: 'C0', point: 2.0 },
  { value: 'C-', label_ko: 'C-', label_en: 'C-', point: 1.7 },
  { value: 'D+', label_ko: 'D+', label_en: 'D+', point: 1.3 },
  { value: 'D0', label_ko: 'D0', label_en: 'D0', point: 1.0 },
  { value: 'D-', label_ko: 'D-', label_en: 'D-', point: 0.7 },
  { value: 'F', label_ko: 'F', label_en: 'F', point: 0.0 },
  { value: 'S', label_ko: 'S (Pass)', label_en: 'S (Pass)' },
  { value: 'U', label_ko: 'U (낙제, GPA 제외)', label_en: 'U (Fail, no GPA)' },
  { value: 'R', label_ko: 'R (재수강, 제외)', label_en: 'R (Retake, excluded)' },
];

const ACCENT = '#a78bfa';
const ACCENT_BG_LIGHT = '#f3efff';
const ACCENT_BG_DARK = '#2a2240';

export function GradePicker({ courseCode, selectedGrade, onSelect, onClose }: Props) {
  const { tokens, isDark } = useTheme();
  const { t, locale } = useLocale();
  const selectedBg = isDark ? ACCENT_BG_DARK : ACCENT_BG_LIGHT;
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: tokens.background, borderColor: tokens.border }]}>
        <View style={[styles.header, { borderBottomColor: tokens.border }]}>
          <Text style={[styles.headerCode, { color: tokens.text }]}>{courseCode}</Text>
          <Text style={[styles.headerLabel, { color: tokens.subtext }]}>
            {t('성적 선택', 'Select grade')}
          </Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
          {GRADE_OPTIONS.map((opt) => {
            const isSelected = opt.value === selectedGrade;
            const label = locale === 'ko' ? opt.label_ko : opt.label_en;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={({ pressed }) => [
                  styles.row,
                  isSelected && { backgroundColor: selectedBg },
                  pressed && !isSelected && { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text
                    style={[
                      styles.label,
                      { color: isSelected ? ACCENT : tokens.text },
                      isSelected && styles.labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  {opt.point !== undefined ? (
                    <Text
                      style={[
                        styles.point,
                        { color: isSelected ? ACCENT : tokens.subtext },
                      ]}
                    >
                      {opt.point.toFixed(1)}
                    </Text>
                  ) : null}
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                  ) : (
                    <View style={styles.checkSlot} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 280,
    maxHeight: 440,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
    paddingBottom: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.22)' } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.24,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 14 },
      },
      android: { elevation: 14 },
    }),
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  headerCode: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 15,
    fontWeight: '600',
  },
  headerLabel: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 11,
  },
  list: {
    maxHeight: 380,
  },
  listInner: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
  },
  labelActive: {
    fontWeight: '600',
  },
  point: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
  },
  checkSlot: {
    width: 18,
    height: 18,
  },
});
