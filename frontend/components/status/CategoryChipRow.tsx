import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { FilterChipId } from '@/lib/mocks/statusFixture';
import { FILTER_CHIPS } from '@/lib/mocks/statusFixture';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  active: FilterChipId;
  onSelect?: (id: FilterChipId) => void;
};

export function CategoryChipRow({ active, onSelect }: Props) {
  const { tokens } = useTheme();
  const { pick } = useLocale();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTER_CHIPS.map((chip) => {
        const isActive = chip.id === active;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect?.(chip.id)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? '#fff' : tokens.subtext },
              ]}
            >
              {pick({ ko: chip.label_ko, en: chip.label_en })}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: '#a78bfa',
  },
  text: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
