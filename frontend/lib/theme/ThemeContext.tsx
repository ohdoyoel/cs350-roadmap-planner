import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeTokens = {
  // 화면 전체 배경 (앱 root).
  background: string;
  // 카드/패널 등 컨테이너 면.
  surface: string;
  // 본문 텍스트.
  text: string;
  // 보조 텍스트.
  subtext: string;
  // 경계선.
  border: string;
  // 헤더 배경 (보통 background 와 같음).
  headerBg: string;
  // PhoneFrame 바깥 (웹에서만 보이는 영역).
  phoneOuter: string;
};

const LIGHT_TOKENS: ThemeTokens = {
  background: '#ffffff',
  surface: '#f3eafe',
  text: '#111111',
  subtext: '#6b7280',
  border: '#e5e7eb',
  headerBg: '#ffffff',
  phoneOuter: '#e5e7eb',
};

const DARK_TOKENS: ThemeTokens = {
  background: '#0f0f12',
  surface: '#1f1b2e',
  text: '#f3f4f6',
  subtext: '#9ca3af',
  border: '#2a2d34',
  headerBg: '#0f0f12',
  phoneOuter: '#000000',
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  tokens: ThemeTokens;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'rp.theme.v1';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && (stored === 'light' || stored === 'dark')) {
          setModeState(stored);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      /* ignore */
    });
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
        /* ignore */
      });
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === 'dark';
    return {
      mode,
      isDark,
      tokens: isDark ? DARK_TOKENS : LIGHT_TOKENS,
      toggle,
      setMode,
    };
  }, [mode, toggle, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
