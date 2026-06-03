import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SemesterOption } from '@/lib/mocks/statusFixture';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  options: SemesterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

const ACCENT = '#a78bfa';
const ACCENT_BG_LIGHT = '#f3efff';
const ACCENT_BG_DARK = '#2a2240';

export function SemesterPicker({ options, selectedId, onSelect, onClose }: Props) {
  const { tokens, isDark } = useTheme();
  const { t } = useLocale();
  const selectedBg = isDark ? ACCENT_BG_DARK : ACCENT_BG_LIGHT;
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: tokens.background, borderColor: tokens.border }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: tokens.text }]}>
            {t('현재 학기', 'Current Semester')}
          </Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
          {options.map((opt) => {
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
                  {opt.label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                ) : (
                  <View style={styles.checkSlot} />
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
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    width: 260,
    maxHeight: 380,
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
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    maxHeight: 320,
  },
  listInner: {
    paddingHorizontal: 6,
    paddingBottom: 4,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
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
