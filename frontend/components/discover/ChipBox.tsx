import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  active: boolean;
  outlineColor: string;
  onPress: () => void;
};

export function ChipBox({ label, active, outlineColor, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? outlineColor : '#e5e7eb',
          borderWidth: active ? 2 : 1,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontFamily: 'Georgia',
    color: '#111',
  },
});
