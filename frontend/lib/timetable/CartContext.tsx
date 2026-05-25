import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { UNPLACED_LIST_ID } from '@/components/timetable/UnplacedCourseRow';
import type { DragInfo } from '@/hooks/useDnD';
import {
  type ApiRoadmap,
  type ApiRoadmapGrade,
  addRoadmapCourse,
  deleteRoadmapCourse,
  getMyRoadmap,
  moveRoadmapCourse,
  setCurrentSemester as apiSetCurrentSemester,
  setRoadmapCourseGrade as apiSetRoadmapCourseGrade,
} from '@/lib/api/roadmap';
import {
  deriveSemesterStatus,
  SEMESTER_SLOTS,
  type Semester,
  type TimetableCard,
} from '@/lib/mocks/timetableFixture';
import { useSession } from '@/lib/session/SessionContext';

type CardLists = Record<string, TimetableCard[]>;

const DEFAULT_CURRENT_SEMESTER = '1-1';

function cardIdFor(semester: string, courseCode: string): string {
  return `placed-${semester}-${courseCode}`;
}

function unplacedCardId(courseCode: string): string {
  return `unplaced-${courseCode}-${Date.now().toString(36)}`;
}

function findPlacedByCardId(
  roadmap: ApiRoadmap | null,
  cardId: string,
): { semester: string; courseCode: string } | null {
  if (!roadmap) return null;
  for (const c of roadmap.courses) {
    if (cardIdFor(c.semester, c.courseCode) === cardId) {
      return { semester: c.semester, courseCode: c.courseCode };
    }
  }
  return null;
}

type CartContextValue = {
  lists: CardLists;
  semesters: Semester[];
  currentSemester: string;
  // roadmap 변경마다 새 값. status 같은 다른 화면이 dep 로 받아 refetch 트리거에 사용.
  roadmapVersion: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addToCart: (courseCode: string) => void;
  handleDrop: (toListId: string, toIndex: number, drag: DragInfo) => Promise<void>;
  setCurrentSemester: (semester: string) => Promise<void>;
  setCourseGrade: (semester: string, courseCode: string, grade: ApiRoadmapGrade) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useSession();
  const [roadmap, setRoadmap] = useState<ApiRoadmap | null>(null);
  const [unplaced, setUnplaced] = useState<TimetableCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rm = await getMyRoadmap();
      setRoadmap(rm);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setRoadmap(null);
      setUnplaced([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyRoadmap()
      .then((rm) => {
        if (!cancelled) {
          setRoadmap(rm);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const currentSemester = roadmap?.currentSemester ?? DEFAULT_CURRENT_SEMESTER;

  const lists = useMemo<CardLists>(() => {
    const out: CardLists = { [UNPLACED_LIST_ID]: unplaced };
    for (const slot of SEMESTER_SLOTS) out[slot.id] = [];
    if (roadmap) {
      for (const c of roadmap.courses) {
        const arr = out[c.semester] ?? [];
        arr.push({
          id: cardIdFor(c.semester, c.courseCode),
          code: c.courseCode,
          variant: 'big',
        });
        out[c.semester] = arr;
      }
    }
    return out;
  }, [roadmap, unplaced]);

  const semesters = useMemo<Semester[]>(
    () =>
      SEMESTER_SLOTS.map((slot) => ({
        id: slot.id,
        label: slot.label,
        bgColor: slot.bgColor,
        status: deriveSemesterStatus(slot.id, currentSemester),
        cards: lists[slot.id] ?? [],
      })),
    [lists, currentSemester],
  );

  const addToCart = useCallback(
    (courseCode: string) => {
      setUnplaced((prev) => {
        if (prev.some((c) => c.code === courseCode)) return prev;
        const alreadyPlaced =
          roadmap?.courses.some((c) => c.courseCode === courseCode) ?? false;
        if (alreadyPlaced) return prev;
        return [
          ...prev,
          { id: unplacedCardId(courseCode), code: courseCode, variant: 'small' },
        ];
      });
    },
    [roadmap],
  );

  const handleDrop = useCallback<CartContextValue['handleDrop']>(
    async (toListId, toIndex, drag) => {
      // 1. unplaced ↔ unplaced 재정렬 (client-only)
      if (drag.fromListId === UNPLACED_LIST_ID && toListId === UNPLACED_LIST_ID) {
        setUnplaced((prev) => {
          const fromIdx = prev.findIndex((c) => c.id === drag.cardId);
          if (fromIdx < 0) return prev;
          const card = prev[fromIdx];
          const remaining = prev.filter((_, i) => i !== fromIdx);
          const adjusted = fromIdx < toIndex ? toIndex - 1 : toIndex;
          const next = [...remaining];
          next.splice(adjusted, 0, card);
          return next;
        });
        return;
      }

      // 2. unplaced → 학기: POST
      if (drag.fromListId === UNPLACED_LIST_ID) {
        const card = unplaced.find((c) => c.id === drag.cardId);
        if (!card) return;
        try {
          const updated = await addRoadmapCourse({
            type: 'catalog',
            semester: toListId,
            courseCode: card.code,
            grade: 'PLANNED',
          });
          setRoadmap(updated);
          setUnplaced((prev) => prev.filter((c) => c.id !== drag.cardId));
        } catch (e) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
        return;
      }

      // 3. 학기 → unplaced: DELETE 후 client 에만 카드 유지
      if (toListId === UNPLACED_LIST_ID) {
        const placed = findPlacedByCardId(roadmap, drag.cardId);
        if (!placed) return;
        try {
          const updated = await deleteRoadmapCourse(placed.semester, placed.courseCode);
          setRoadmap(updated);
          setUnplaced((prev) => [
            ...prev,
            {
              id: unplacedCardId(placed.courseCode),
              code: placed.courseCode,
              variant: 'small',
            },
          ]);
        } catch (e) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
        return;
      }

      // 4. 같은 학기 내 재정렬: backend 에 순서 개념이 없어 noop.
      if (drag.fromListId === toListId) return;

      // 5. 학기 ↔ 다른 학기: MOVE
      const placed = findPlacedByCardId(roadmap, drag.cardId);
      if (!placed) return;
      try {
        const updated = await moveRoadmapCourse({
          courseCode: placed.courseCode,
          fromSemester: placed.semester,
          toSemester: toListId,
        });
        setRoadmap(updated);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    },
    [unplaced, roadmap],
  );

  const setCurrentSemester = useCallback(async (semester: string) => {
    try {
      const updated = await apiSetCurrentSemester(semester);
      setRoadmap(updated);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const setCourseGrade = useCallback(
    async (semester: string, courseCode: string, grade: ApiRoadmapGrade) => {
      try {
        const updated = await apiSetRoadmapCourseGrade(semester, courseCode, grade);
        setRoadmap(updated);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    },
    [],
  );

  const roadmapVersion = roadmap?.updatedAt ?? '';

  const value = useMemo<CartContextValue>(
    () => ({
      lists,
      semesters,
      currentSemester,
      roadmapVersion,
      loading,
      error,
      refresh,
      addToCart,
      handleDrop,
      setCurrentSemester,
      setCourseGrade,
    }),
    [
      lists,
      semesters,
      currentSemester,
      roadmapVersion,
      loading,
      error,
      refresh,
      addToCart,
      handleDrop,
      setCurrentSemester,
      setCourseGrade,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
