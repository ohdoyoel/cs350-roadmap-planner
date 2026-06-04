import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import { ACADEMIC_TRACK_OPTIONS } from '@/lib/mocks/settingsFixture';
import type { AcademicTrack } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  selectedId: AcademicTrack;
  onSelect: (id: AcademicTrack) => void;
  onClose: () => void;
};

const ACCENT = '#a78bfa';
const ACCENT_BG_LIGHT = '#f3efff';
const ACCENT_BG_DARK = '#2a2240';

export function AcademicPicker({ selectedId, onSelect, onClose }: Props) {
  const { tokens, isDark } = useTheme();
  const { t, pick } = useLocale();
  const selectedBg = isDark ? ACCENT_BG_DARK : ACCENT_BG_LIGHT;
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: tokens.background, borderColor: tokens.border }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: tokens.text }]}>
            {t('학적 옵션', 'Academic Option')}
          </Text>
          <Text style={[styles.headerSub, { color: tokens.subtext }]}>
            {t('졸업 요건 학점이 자동 반영돼요', 'Graduation requirements adjust automatically')}
          </Text>
        </View>
        <View style={styles.list}>
          {ACADEMIC_TRACK_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedId;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onSelect(opt.id)}
                style={({ pressed }) => [
                  styles.row,
                  isSelected && { backgroundColor: selectedBg },
                  pressed && !isSelected && { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: isSelected ? ACCENT : tokens.text },
                    isSelected && styles.labelActive,
                  ]}
                >
                  {pick({ ko: opt.label_ko, en: opt.label_en })}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                ) : (
                  <View style={styles.checkSlot} />
                )}
              </Pressable>
            );
          })}
        </View>
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
    top: '28%',
    alignSelf: 'center',
    width: 300,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.2)' } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 2,
  },
  headerTitle: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 15,
    fontWeight: '600',
  },
  headerSub: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 11,
  },
  list: {
    paddingHorizontal: 6,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  label: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
  },
  labelActive: {
    fontWeight: '600',
  },
  checkSlot: {
    width: 18,
    height: 18,
  },
});
