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

export type Locale = 'ko' | 'en';

type LocaleContextValue = {
  locale: Locale;
  isKo: boolean;
  isEn: boolean;
  // 가장 흔한 i18n 패턴: t(ko, en) → 현재 locale 에 맞는 문자열.
  t: (ko: string, en: string) => string;
  // ko/en 한 쪽이 null/undefined 면 다른 쪽 fallback.
  pick: (input: { ko?: string | null; en?: string | null }) => string;
  setLocale: (next: Locale) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'rp.locale.v1';

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && (stored === 'ko' || stored === 'en')) {
          setLocaleState(stored);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      /* ignore */
    });
  }, []);

  const toggle = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === 'ko' ? 'en' : 'ko';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
        /* ignore */
      });
      return next;
    });
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const t = (ko: string, en: string) => (locale === 'ko' ? ko : en);
    const pick = (input: { ko?: string | null; en?: string | null }) => {
      const primary = locale === 'ko' ? input.ko : input.en;
      const fallback = locale === 'ko' ? input.en : input.ko;
      return primary ?? fallback ?? '';
    };
    return {
      locale,
      isKo: locale === 'ko',
      isEn: locale === 'en',
      t,
      pick,
      setLocale,
      toggle,
    };
  }, [locale, setLocale, toggle]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
