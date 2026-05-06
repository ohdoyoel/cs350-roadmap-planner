import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  onLeftPress?: () => void;
};

export function AppHeader({ title, onLeftPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onLeftPress}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.leftSlot}
        disabled={!onLeftPress}
      >
        <Ionicons name="menu" size={24} color="#111" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.profile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  leftSlot: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
});
