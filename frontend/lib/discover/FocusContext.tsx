import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { ApiCourse } from '@/lib/api/courses';

type FocusState = {
  code: string;
  category: ApiCourse['category'];
  sector: string | null;
};

type FocusContextValue = {
  focus: FocusState | null;
  setFocus: (course: ApiCourse) => void;
  clearFocus: () => void;
};

const FocusContext = createContext<FocusContextValue | null>(null);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<FocusState | null>(null);

  const setFocus = useCallback((course: ApiCourse) => {
    setFocusState({
      code: course.courseCode,
      category: course.category,
      sector: course.sectors[0] ?? null,
    });
  }, []);

  const clearFocus = useCallback(() => setFocusState(null), []);

  const value = useMemo(() => ({ focus, setFocus, clearFocus }), [focus, setFocus, clearFocus]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within FocusProvider');
  return ctx;
}
