import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useDnD } from '@/hooks/useDnD';

type Props = {
  listId: string;
  visibleCardIds: string[];
  mapVisibleToFullIndex?: (visibleIndex: number) => number;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function Droppable(props: Props) {
  return Platform.OS === 'web' ? <WebDroppable {...props} /> : <NativeDroppable {...props} />;
}

function WebDroppable({
  listId,
  visibleCardIds,
  mapVisibleToFullIndex,
  style,
  hoverStyle,
  children,
}: Props) {
  const ref = useRef<View | null>(null);
  const { getDrag, setDrag, onDrop } = useDnD();
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;
    el.dataset.listId = listId;

    const handleOver = (e: DragEvent) => {
      if (!getDrag()) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      setHovering(true);
    };
    const handleLeave = (e: DragEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setHovering(false);
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setHovering(false);
      const drag = getDrag();
      if (!drag) return;
      const cardEls = visibleCardIds
        .map((id) => el.querySelector(`[data-card-id="${id}"]`) as HTMLElement | null)
        .filter((x): x is HTMLElement => Boolean(x));
      let visibleIndex = cardEls.length;
      for (let i = 0; i < cardEls.length; i++) {
        const r = cardEls[i].getBoundingClientRect();
        if (e.clientX < r.left + r.width / 2) {
          visibleIndex = i;
          break;
        }
      }
      const toIndex = mapVisibleToFullIndex ? mapVisibleToFullIndex(visibleIndex) : visibleIndex;
      onDrop(listId, toIndex, drag);
      setDrag(null);
    };

    el.addEventListener('dragover', handleOver);
    el.addEventListener('dragleave', handleLeave);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragover', handleOver);
      el.removeEventListener('dragleave', handleLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [listId, visibleCardIds, mapVisibleToFullIndex, getDrag, setDrag, onDrop]);

  return (
    <View ref={ref} style={[style, hovering && (hoverStyle ?? styles.defaultHover)]}>
      {children}
    </View>
  );
}

function NativeDroppable({
  listId,
  visibleCardIds,
  mapVisibleToFullIndex,
  style,
  hoverStyle,
  children,
}: Props) {
  const viewRef = useRef<View | null>(null);
  const { registerDropzone, unregisterDropzone, hoveringListId } = useDnD();
  const isHovering = hoveringListId === listId;

  const measure = () => {
    const node = viewRef.current;
    if (!node) return;
    node.measureInWindow((x, y, w, h) => {
      registerDropzone(listId, { x, y, w, h, visibleCardIds, mapVisibleToFullIndex });
    });
  };

  useEffect(() => {
    measure();
    return () => unregisterDropzone(listId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  // 카드 변경 시 dropzone 의 visibleCardIds 도 최신화
  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCardIds, mapVisibleToFullIndex]);

  return (
    <View
      ref={viewRef}
      onLayout={measure}
      style={[style, isHovering && (hoverStyle ?? styles.defaultHover)]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultHover: {
    borderWidth: 2,
    borderColor: '#a78bfa',
    borderStyle: 'dashed',
  },
});
