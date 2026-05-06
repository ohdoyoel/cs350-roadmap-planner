import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuIcon } from '@/components/icons/MenuIcon';

type Props = {
  title?: string;
  children?: ReactNode;
  onLeftPress?: () => void;
};

export function AppHeader({ title, children, onLeftPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onLeftPress}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.leftSlot}
        disabled={!onLeftPress}
      >
        <MenuIcon size={24} />
      </Pressable>
      <View style={styles.titleSlot}>
        {children ?? (title ? <Text style={styles.title}>{title}</Text> : null)}
      </View>
      <View style={styles.profile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  leftSlot: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#111',
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
});
