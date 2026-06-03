import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TRASH_LIST_ID } from '@/components/timetable/TrashDropZone';
import { UNPLACED_LIST_ID } from '@/components/timetable/UnplacedCourseRow';
import type { DragInfo } from '@/hooks/useDnD';
import {
  type ApiPrerequisiteWarning,
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
  buildExtraSemesterSlot,
  deriveSemesterStatus,
  nextExtraSemesterId,
  SEMESTER_SLOTS,
  type Semester,
  type SemesterSlot,
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

export type AddCustomCourseInput = {
  semester: string;
  courseCode: string;
  title: string;
  credit: number;
  category: string;
};

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
  addCustomCourse: (input: AddCustomCourseInput) => Promise<void>;
  deleteCourse: (semester: string, courseCode: string) => Promise<void>;
  // 4년(8학기) 밖 추가 학기.
  addExtraSemester: () => void;
  removeExtraSemester: (id: string) => Promise<void>;
  isExtraSemester: (id: string) => boolean;
  // 마지막 mutation 직후 새로 생긴 선수과목 경고. 한 번 소비되면 호출자가 dismiss.
  // 매번 새 array reference 라 useEffect dep 으로 사용 가능.
  newWarnings: ApiPrerequisiteWarning[];
  dismissWarnings: () => void;
};

function warningKey(w: ApiPrerequisiteWarning): string {
  return `${w.courseCode}|${w.requiredCourseCode}`;
}

function diffWarnings(
  prev: ApiPrerequisiteWarning[] | undefined,
  next: ApiPrerequisiteWarning[],
): ApiPrerequisiteWarning[] {
  if (!prev?.length) return next;
  const seen = new Set(prev.map(warningKey));
  return next.filter((w) => !seen.has(warningKey(w)));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useSession();
  const [roadmap, setRoadmap] = useState<ApiRoadmap | null>(null);
  const [unplaced, setUnplaced] = useState<TimetableCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newWarnings, setNewWarnings] = useState<ApiPrerequisiteWarning[]>([]);
  const [manualExtras, setManualExtras] = useState<string[]>([]);

  // mutation 응답에서만 사용 — diff 한 신규 경고만 emit.
  const applyMutationResult = useCallback(
    (updated: ApiRoadmap) => {
      setRoadmap((prev) => {
        const fresh = diffWarnings(prev?.warnings, updated.warnings ?? []);
        if (fresh.length > 0) {
          // 새 array 로 emit (이전 dismiss 후에도 같은 reference 면 dep 안 바뀌어서 alert 재표시 안 됨).
          setNewWarnings(fresh);
        }
        return updated;
      });
    },
    [],
  );

  const dismissWarnings = useCallback(() => {
    setNewWarnings([]);
  }, []);

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

  // 표준 4년 슬롯 + 사용자가 추가한 extras + 백엔드 course 가 가리키는 미등록 extras (재로드 후 복원).
  const extraSlots = useMemo<SemesterSlot[]>(() => {
    const baseIds = new Set(SEMESTER_SLOTS.map((s) => s.id));
    const extraIds = new Set(manualExtras);
    if (roadmap) {
      for (const c of roadmap.courses) {
        if (!baseIds.has(c.semester)) extraIds.add(c.semester);
      }
    }
    return Array.from(extraIds)
      .sort((a, b) => {
        const [ay, at] = a.split('-').map(Number);
        const [by, bt] = b.split('-').map(Number);
        return ay !== by ? ay - by : at - bt;
      })
      .map(buildExtraSemesterSlot);
  }, [manualExtras, roadmap]);

  const allSlots = useMemo<SemesterSlot[]>(
    () => [...SEMESTER_SLOTS, ...extraSlots],
    [extraSlots],
  );

  const lists = useMemo<CardLists>(() => {
    const out: CardLists = { [UNPLACED_LIST_ID]: unplaced };
    for (const slot of allSlots) out[slot.id] = [];
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
  }, [roadmap, unplaced, allSlots]);

  const semesters = useMemo<Semester[]>(
    () =>
      allSlots.map((slot) => ({
        id: slot.id,
        label_ko: slot.label_ko,
        label_en: slot.label_en,
        bgColor: slot.bgColor,
        status: deriveSemesterStatus(slot.id, currentSemester),
        cards: lists[slot.id] ?? [],
      })),
    [lists, currentSemester, allSlots],
  );

  const extraSemesterIds = useMemo(() => new Set(extraSlots.map((s) => s.id)), [extraSlots]);

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
      // 0. 휴지통 drop — unplaced 면 클라이언트만 정리, placed 면 backend DELETE.
      if (toListId === TRASH_LIST_ID) {
        if (drag.fromListId === UNPLACED_LIST_ID) {
          setUnplaced((prev) => prev.filter((c) => c.id !== drag.cardId));
          return;
        }
        const placed = findPlacedByCardId(roadmap, drag.cardId);
        if (!placed) return;
        try {
          const updated = await deleteRoadmapCourse(placed.semester, placed.courseCode);
          applyMutationResult(updated);
        } catch (e) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
        return;
      }

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
          applyMutationResult(updated);
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
          applyMutationResult(updated);
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
        applyMutationResult(updated);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    },
    [unplaced, roadmap],
  );

  const setCurrentSemester = useCallback(async (semester: string) => {
    try {
      const updated = await apiSetCurrentSemester(semester);
      applyMutationResult(updated);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const setCourseGrade = useCallback(
    async (semester: string, courseCode: string, grade: ApiRoadmapGrade) => {
      try {
        const updated = await apiSetRoadmapCourseGrade(semester, courseCode, grade);
        applyMutationResult(updated);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    },
    [],
  );

  const addCustomCourse = useCallback(async (input: AddCustomCourseInput) => {
    try {
      const updated = await addRoadmapCourse({
        type: 'custom',
        semester: input.semester,
        courseCode: input.courseCode,
        title: input.title,
        credit: input.credit,
        category: input.category,
        grade: 'PLANNED',
      });
      applyMutationResult(updated);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    }
  }, []);

  const deleteCourse = useCallback(async (semester: string, courseCode: string) => {
    try {
      const updated = await deleteRoadmapCourse(semester, courseCode);
      applyMutationResult(updated);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    }
  }, []);

  const addExtraSemester = useCallback(() => {
    setManualExtras((prev) => {
      const usedIds = new Set<string>([
        ...SEMESTER_SLOTS.map((s) => s.id),
        ...prev,
        ...(roadmap?.courses.map((c) => c.semester) ?? []),
      ]);
      const nextId = nextExtraSemesterId(usedIds);
      return [...prev, nextId];
    });
  }, [roadmap]);

  const removeExtraSemester = useCallback(
    async (id: string) => {
      // 백엔드에서 해당 학기의 모든 course 제거 → 마지막 응답을 적용.
      const targetCourses = roadmap?.courses.filter((c) => c.semester === id) ?? [];
      let latest: ApiRoadmap | null = null;
      for (const c of targetCourses) {
        try {
          latest = await deleteRoadmapCourse(id, c.courseCode);
        } catch (e) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      }
      if (latest) applyMutationResult(latest);
      setManualExtras((prev) => prev.filter((x) => x !== id));
    },
    [roadmap, applyMutationResult],
  );

  const isExtraSemester = useCallback(
    (id: string) => extraSemesterIds.has(id),
    [extraSemesterIds],
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
      addCustomCourse,
      deleteCourse,
      addExtraSemester,
      removeExtraSemester,
      isExtraSemester,
      newWarnings,
      dismissWarnings,
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
      addCustomCourse,
      deleteCourse,
      addExtraSemester,
      removeExtraSemester,
      isExtraSemester,
      newWarnings,
      dismissWarnings,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
