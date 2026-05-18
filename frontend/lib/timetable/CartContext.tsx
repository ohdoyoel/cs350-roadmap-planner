import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { DragInfo } from '@/hooks/useDnD';
import { UNPLACED_LIST_ID } from '@/components/timetable/UnplacedCourseRow';
import { SEMESTERS, type TimetableCard } from '@/lib/mocks/timetableFixture';

type CardLists = Record<string, TimetableCard[]>;

function initialLists(): CardLists {
  return {
    [UNPLACED_LIST_ID]: [],
    ...Object.fromEntries(SEMESTERS.map((s) => [s.id, s.cards])),
  };
}

type CartContextValue = {
  lists: CardLists;
  addToCart: (courseCode: string) => void;
  handleDrop: (toListId: string, toIndex: number, drag: DragInfo) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<CardLists>(initialLists);

  const addToCart = useCallback((courseCode: string) => {
    setLists((prev) => {
      const unplaced = prev[UNPLACED_LIST_ID] ?? [];
      if (unplaced.some((c) => c.code === courseCode)) return prev;
      const allCards = Object.values(prev).flat();
      if (allCards.some((c) => c.code === courseCode)) return prev;
      const id = `cart-${courseCode.toLowerCase()}-${Date.now().toString(36)}`;
      return {
        ...prev,
        [UNPLACED_LIST_ID]: [...unplaced, { id, code: courseCode, variant: 'small' }],
      };
    });
  }, []);

  const handleDrop = useCallback(
    (toListId: string, toIndex: number, drag: DragInfo) => {
      setLists((prev) => {
        const fromList = prev[drag.fromListId];
        if (!fromList) return prev;
        const card = fromList.find((c) => c.id === drag.cardId);
        if (!card) return prev;

        const remaining = fromList.filter((c) => c.id !== drag.cardId);

        if (drag.fromListId === toListId) {
          const fromIndex = fromList.findIndex((c) => c.id === drag.cardId);
          const adjusted = fromIndex < toIndex ? toIndex - 1 : toIndex;
          const next = [...remaining];
          next.splice(adjusted, 0, card);
          return { ...prev, [toListId]: next };
        }

        const toNext = [...(prev[toListId] ?? [])];
        toNext.splice(toIndex, 0, card);
        return { ...prev, [drag.fromListId]: remaining, [toListId]: toNext };
      });
    },
    [],
  );

  const value = useMemo(() => ({ lists, addToCart, handleDrop }), [lists, addToCart, handleDrop]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
