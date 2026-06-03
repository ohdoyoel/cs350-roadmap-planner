import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export function ToggleRow({ label, value, onValueChange }: Props) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: tokens.surface }]}>
      <Text style={[styles.label, { color: tokens.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d4d4d8', true: '#c4b5fd' }}
        thumbColor={value ? '#a78bfa' : '#f4f4f5'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
  },
  label: {
    fontSize: 18,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
