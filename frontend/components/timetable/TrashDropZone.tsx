import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Droppable } from '@/components/timetable/Droppable';
import { useDnD } from '@/hooks/useDnD';

export const TRASH_LIST_ID = 'trash';

export function TrashDropZone() {
  const { drag, hoveringListId } = useDnD();
  const opacity = useRef(new Animated.Value(0)).current;
  const isHovering = hoveringListId === TRASH_LIST_ID;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: drag ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [drag, opacity]);

  if (!drag) {
    // 드래그 중일 때만 hit-test 대상으로 등록 — 평시에는 mount 안 함.
    return null;
  }

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrap, { opacity }]}>
      <Droppable
        listId={TRASH_LIST_ID}
        visibleCardIds={[]}
        style={[styles.zone, isHovering && styles.zoneHover]}
        hoverStyle={styles.zoneHover}
      >
        <View style={styles.inner} pointerEvents="none">
          <Ionicons
            name="trash-outline"
            size={22}
            color={isHovering ? '#fff' : '#ef4444'}
          />
        </View>
      </Droppable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  zone: {
    width: 96,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneHover: {
    backgroundColor: '#ef4444',
    borderStyle: 'solid',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
