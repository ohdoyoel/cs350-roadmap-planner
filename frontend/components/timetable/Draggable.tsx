import { useEffect, useRef, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useDnD } from '@/hooks/useDnD';

type Props = {
  cardId: string;
  fromListId: string;
  children: ReactNode;
};

export function Draggable(props: Props) {
  return Platform.OS === 'web' ? <WebDraggable {...props} /> : <NativeDraggable {...props} />;
}

function WebDraggable({ cardId, fromListId, children }: Props) {
  const ref = useRef<View | null>(null);
  const { setDrag } = useDnD();

  useEffect(() => {
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;
    el.setAttribute('draggable', 'true');
    el.dataset.cardId = cardId;
    const handleStart = (e: DragEvent) => {
      setDrag({ cardId, fromListId });
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', cardId);
      }
    };
    const handleEnd = () => setDrag(null);
    el.addEventListener('dragstart', handleStart);
    el.addEventListener('dragend', handleEnd);
    return () => {
      el.removeEventListener('dragstart', handleStart);
      el.removeEventListener('dragend', handleEnd);
    };
  }, [cardId, fromListId, setDrag]);

  return <View ref={ref}>{children}</View>;
}

function NativeDraggable({ cardId, fromListId, children }: Props) {
  const viewRef = useRef<View | null>(null);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const dragging = useSharedValue(0);
  const { setDrag, hitTest, finalizeDrop, registerCard, unregisterCard } = useDnD();

  const measure = () => {
    const node = viewRef.current;
    if (!node || typeof (node as any).measureInWindow !== 'function') return;
    (node as any).measureInWindow((x: number, y: number, w: number, h: number) => {
      registerCard(cardId, { listId: fromListId, x, y, w, h });
    });
  };

  useEffect(() => {
    measure();
    return () => unregisterCard(cardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, fromListId]);

  const pan = Gesture.Pan()
    .activateAfterLongPress(180)
    .onStart(() => {
      dragging.value = 1;
      runOnJS(setDrag)({ cardId, fromListId });
    })
    .onChange((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
      runOnJS(hitTest)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      runOnJS(finalizeDrop)(e.absoluteX, e.absoluteY);
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      dragging.value = 0;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: dragging.value ? 1.05 : 1 },
    ],
    zIndex: dragging.value ? 999 : 1,
    elevation: dragging.value ? 8 : 0,
    opacity: dragging.value ? 0.92 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View ref={viewRef as never} onLayout={measure} style={animStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
