import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  onPress?: () => void;
};

export function AddSemesterRow({ onPress }: Props) {
  const { tokens } = useTheme();
  const { t } = useLocale();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderColor: tokens.border }]}>
      <View style={styles.inner}>
        <Text style={[styles.label, { color: tokens.subtext }]}>{t('연차초과자', 'Extra Semester')}</Text>
        <Ionicons name="add" size={28} color={tokens.subtext} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  inner: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
