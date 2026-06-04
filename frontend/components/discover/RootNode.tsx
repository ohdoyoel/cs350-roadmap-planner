import { StyleSheet, Text, View } from 'react-native';

type Props = {
  courseCode: string;
  courseName: string;
};

export function RootNode({ courseCode, courseName }: Props) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label} numberOfLines={1}>
        {courseName}({courseCode})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 12,
    backgroundColor: '#86efac',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#064e3b',
  },
});
