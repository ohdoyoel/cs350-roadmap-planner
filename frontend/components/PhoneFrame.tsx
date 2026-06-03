import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeContext';

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={[styles.outer, { backgroundColor: tokens.phoneOuter }]}>
      <View style={[styles.frame, { backgroundColor: tokens.background }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  frame: {
    width: 400,
    height: 844,
    overflow: 'hidden',
    borderRadius: 18,
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' } as object,
      default: {},
    }),
  },
});
