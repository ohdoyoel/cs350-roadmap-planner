import { StyleSheet, Text, View } from 'react-native';

export type MiniStatusItem = {
  label: string;
  earned: number;
  total: number;
};

type Props = {
  items: MiniStatusItem[];
};

export function MiniStatus({ items }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Text key={item.label} style={styles.line}>
          {item.label}: {item.earned} / {item.total}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    gap: 2,
  },
  line: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#374151',
  },
});
