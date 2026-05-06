import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export function PhoneFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  frame: {
    width: 400,
    height: 844,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 18,
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' } as object,
      default: {},
    }),
  },
});
