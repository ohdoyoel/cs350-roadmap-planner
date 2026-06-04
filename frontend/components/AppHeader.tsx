import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GradientAvatar } from '@/components/GradientAvatar';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { useSession } from '@/lib/session/SessionContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  title?: string;
  children?: ReactNode;
  onLeftPress?: () => void;
  leftIcon?: 'menu' | 'back';
};

export function AppHeader({ title, children, onLeftPress, leftIcon = 'menu' }: Props) {
  const { user } = useSession();
  const { tokens } = useTheme();

  const seed = user?.kaistEmail ?? user?.id ?? 'anon';

  return (
    <View style={[styles.container, { backgroundColor: tokens.headerBg }]}>
      <View style={styles.leftSlot}>
        {onLeftPress ? (
          <Pressable onPress={onLeftPress} hitSlop={8} accessibilityRole="button">
            {leftIcon === 'back' ? (
              <Ionicons name="arrow-back" size={24} color={tokens.text} />
            ) : (
              <MenuIcon size={24} color={tokens.text} />
            )}
          </Pressable>
        ) : null}
      </View>
      <View style={styles.titleSlot}>
        {children ?? (title ? <Text style={[styles.title, { color: tokens.text }]}>{title}</Text> : null)}
      </View>
      <Pressable
        onPress={() => router.push('/settings')}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <GradientAvatar seed={seed} size={32} />
      </Pressable>
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
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111',
  },
});
