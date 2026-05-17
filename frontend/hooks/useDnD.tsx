import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

export type DragInfo = {
  cardId: string;
  fromListId: string;
};

export type DropHandler = (toListId: string, toIndex: number, drag: DragInfo) => void;

export type CardBox = {
  listId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DropZone = {
  x: number;
  y: number;
  w: number;
  h: number;
  visibleCardIds: string[];
  mapVisibleToFullIndex?: (visibleIndex: number) => number;
};

type Ctx = {
  drag: DragInfo | null;
  setDrag: (d: DragInfo | null) => void;
  getDrag: () => DragInfo | null;
  onDrop: DropHandler;
  // native 등록·hit-test (웹에선 사용되지 않음)
  registerCard: (cardId: string, box: CardBox) => void;
  unregisterCard: (cardId: string) => void;
  registerDropzone: (listId: string, zone: DropZone) => void;
  unregisterDropzone: (listId: string) => void;
  hitTest: (x: number, y: number) => void;
  finalizeDrop: (x: number, y: number) => void;
  hoveringListId: string | null;
};

const DnDContext = createContext<Ctx | null>(null);

export function DnDProvider({ onDrop, children }: { onDrop: DropHandler; children: ReactNode }) {
  const dragRef = useRef<DragInfo | null>(null);
  const [drag, setDragState] = useState<DragInfo | null>(null);
  const cardBoxes = useRef<Map<string, CardBox>>(new Map());
  const dropZones = useRef<Map<string, DropZone>>(new Map());
  const [hoveringListId, setHoveringListId] = useState<string | null>(null);

  const setDrag = useCallback((d: DragInfo | null) => {
    dragRef.current = d;
    setDragState(d);
    if (!d) setHoveringListId(null);
  }, []);
  const getDrag = useCallback(() => dragRef.current, []);

  const registerCard = useCallback((cardId: string, box: CardBox) => {
    cardBoxes.current.set(cardId, box);
  }, []);
  const unregisterCard = useCallback((cardId: string) => {
    cardBoxes.current.delete(cardId);
  }, []);
  const registerDropzone = useCallback((listId: string, zone: DropZone) => {
    dropZones.current.set(listId, zone);
  }, []);
  const unregisterDropzone = useCallback((listId: string) => {
    dropZones.current.delete(listId);
  }, []);

  const findHit = useCallback(
    (x: number, y: number): { listId: string; visibleIndex: number } | null => {
      let hit: { listId: string; zone: DropZone } | null = null;
      for (const [listId, zone] of dropZones.current) {
        if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
          hit = { listId, zone };
          break;
        }
      }
      if (!hit) return null;
      const cards = hit.zone.visibleCardIds
        .map((id) => cardBoxes.current.get(id))
        .filter((b): b is CardBox => Boolean(b));
      let idx = cards.length;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (x < c.x + c.w / 2) {
          idx = i;
          break;
        }
      }
      return { listId: hit.listId, visibleIndex: idx };
    },
    [],
  );

  const hitTest = useCallback(
    (x: number, y: number) => {
      const hit = findHit(x, y);
      const next = hit?.listId ?? null;
      setHoveringListId((prev) => (prev === next ? prev : next));
    },
    [findHit],
  );

  const finalizeDrop = useCallback(
    (x: number, y: number) => {
      const d = dragRef.current;
      setDrag(null);
      if (!d) return;
      const hit = findHit(x, y);
      if (!hit) return;
      const zone = dropZones.current.get(hit.listId);
      if (!zone) return;
      const toIndex = zone.mapVisibleToFullIndex
        ? zone.mapVisibleToFullIndex(hit.visibleIndex)
        : hit.visibleIndex;
      onDrop(hit.listId, toIndex, d);
    },
    [findHit, onDrop, setDrag],
  );

  return (
    <DnDContext.Provider
      value={{
        drag,
        setDrag,
        getDrag,
        onDrop,
        registerCard,
        unregisterCard,
        registerDropzone,
        unregisterDropzone,
        hitTest,
        finalizeDrop,
        hoveringListId,
      }}
    >
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const c = useContext(DnDContext);
  if (!c) throw new Error('useDnD must be used inside DnDProvider');
  return c;
}

export const isWebDnDEnabled = Platform.OS === 'web';
