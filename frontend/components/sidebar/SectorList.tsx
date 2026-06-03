import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SUBTOPICS, SUBTOPIC_ORDER } from '@/constants/Subtopics';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SubtopicId } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  active: SubtopicId | null;
  onSelect: (id: SubtopicId | null) => void;
};

export function SectorList({ active, onSelect }: Props) {
  const { tokens, isDark } = useTheme();
  const { t, isKo } = useLocale();
  return (
    <View style={styles.wrap}>
      <View style={[styles.headerRow, { backgroundColor: isDark ? tokens.surface : '#f3f4f6' }]}>
        <Text style={[styles.header, { color: tokens.subtext }]}>{t('과목 분류', 'Subject Areas')}</Text>
      </View>
      <View style={styles.list}>
        {SUBTOPIC_ORDER.map((id) => {
          const sub = SUBTOPICS[id];
          const isActive = id === active;
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(isActive ? null : id)}
              style={[
                styles.row,
                {
                  backgroundColor: isDark ? tokens.surface : '#fff',
                  borderColor: isActive ? '#7c3aed' : tokens.border,
                  borderWidth: isActive ? 1.5 : 1,
                },
              ]}
            >
              <Text style={[styles.label, { color: tokens.text }]}>
                {isKo ? sub.label_ko : sub.label_en}
              </Text>
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  header: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  list: { gap: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
