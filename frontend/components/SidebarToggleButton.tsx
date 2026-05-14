import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useSidebar } from '@/lib/sidebar/SidebarContext';

const SIZE = 48;
const HIDDEN_WIDTH = 16;

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
      <Ionicons name="search" size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: '24%',
    right: -HIDDEN_WIDTH,
    width: SIZE + HIDDEN_WIDTH,
    height: SIZE,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#d4d4d8',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 14,
  },
});
