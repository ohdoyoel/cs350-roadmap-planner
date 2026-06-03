import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder }: Props) {
  const { tokens, isDark } = useTheme();
  const { t } = useLocale();
  const resolved = placeholder ?? t('과목 검색', 'Search courses');
  return (
    <View style={[styles.row, { backgroundColor: isDark ? tokens.surface : '#f3f4f6' }]}>
      <Ionicons name="search" size={16} color={tokens.subtext} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={resolved}
        placeholderTextColor={tokens.subtext}
        style={[styles.input, { color: tokens.text }] as never}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    outlineStyle: 'none',
  } as never,
});
