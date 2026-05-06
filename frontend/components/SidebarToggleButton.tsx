import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useSidebar } from '@/lib/sidebar/SidebarContext';

export function SidebarToggleButton() {
  const { open } = useSidebar();
  return (
    <Pressable
      onPress={open}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Open sidebar"
      hitSlop={8}
    >
      <Ionicons name="search" size={20} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: '42%',
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
