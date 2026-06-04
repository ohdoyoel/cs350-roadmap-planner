import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { useLocale } from '@/lib/locale/LocaleContext';
import { ACADEMIC_TRACK_OPTIONS } from '@/lib/mocks/settingsFixture';
import type { AcademicTrack } from '@/lib/mocks/types';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  selected: AcademicTrack;
  onPress: () => void;
};

export function AcademicCard({ selected, onPress }: Props) {
  const { isDark } = useTheme();
  const { t, pick } = useLocale();
  const opt = ACADEMIC_TRACK_OPTIONS.find((o) => o.id === selected) ?? ACADEMIC_TRACK_OPTIONS[0];
  // 다크에선 보라 톤 살짝 어둡게.
  const cardBg = isDark ? '#3d2f63' : '#e3d5fc';
  const pillBg = isDark ? '#1f1b2e' : '#fff';
  const pillText = isDark ? '#e5e7eb' : '#374151';
  const titleColor = isDark ? '#f3f4f6' : '#111';
  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        {t('졸업 요건 설정', 'Graduation Requirements')}
      </Text>
      <Pressable
        onPress={onPress}
        style={[styles.pill, { backgroundColor: pillBg }]}
        accessibilityRole="button"
      >
        <Text style={[styles.pillText, { color: pillText }]}>
          {pick({ ko: opt.label_ko, en: opt.label_en })}
        </Text>
        <DiamondIcon size={10} color={pillText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 14,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
