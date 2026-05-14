import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSidebar } from '@/lib/sidebar/SidebarContext';

const PANEL_WIDTH = 320;
const ANIM_DURATION = 220;

export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();
  const translateX = useSharedValue(PANEL_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : PANEL_WIDTH, { duration: ANIM_DURATION });
    backdropOpacity.value = withTiming(isOpen ? 1 : 0, { duration: ANIM_DURATION });
  }, [isOpen, translateX, backdropOpacity]);

  const panelStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: translateX.value }] }),
    [translateX],
  );
  const backdropStyle = useAnimatedStyle(
    () => ({ opacity: backdropOpacity.value }),
    [backdropOpacity],
  );

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <Animated.View style={[styles.panel, panelStyle]}>
        <View style={styles.panelHeader}>
          <Pressable
            onPress={close}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
          >
            <Ionicons name="close" size={22} color="#111" />
          </Pressable>
        </View>
        <View style={styles.panelBody} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  panelBody: {
    flex: 1,
  },
});
