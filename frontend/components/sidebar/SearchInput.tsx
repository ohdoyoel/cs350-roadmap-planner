import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder = '과목 검색' }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="search" size={16} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={styles.input as never}
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
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#111',
    outlineStyle: 'none',
  } as never,
});
