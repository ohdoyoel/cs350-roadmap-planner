import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ApiError,
  setApiTokenProvider,
} from '@/lib/api/client';
import {
  type ApiMe,
  type ApiSession,
  type ApiUser,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from '@/lib/api/auth';
import { type AcademicOption, updateAcademicOption } from '@/lib/api/users';

const STORAGE_KEY = 'rp.session.v1';

type Persisted = {
  sessionToken: string;
  user: ApiUser;
};

type SessionContextValue = {
  ready: boolean;
  token: string | null;
  user: ApiUser | null;
  me: ApiMe | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setAcademicOption: (option: AcademicOption) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [me, setMe] = useState<ApiMe | null>(null);
  const tokenRef = useRef<string | null>(null);

  // 토큰을 ref로도 유지해서 client.ts의 동기 호출자에 즉시 반영.
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    setApiTokenProvider(() => tokenRef.current);
    return () => setApiTokenProvider(null);
  }, []);

  const persist = useCallback(async (next: Persisted | null) => {
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const applySession = useCallback(
    async (session: ApiSession) => {
      tokenRef.current = session.sessionToken;
      setToken(session.sessionToken);
      setUser(session.user);
      await persist({ sessionToken: session.sessionToken, user: session.user });
    },
    [persist],
  );

  const clearSession = useCallback(async () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    setMe(null);
    await persist(null);
  }, [persist]);

  // 부팅 시 저장된 세션 복원 + /me 호출로 유효성 확인.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Persisted;
        if (cancelled) return;
        tokenRef.current = parsed.sessionToken;
        setToken(parsed.sessionToken);
        setUser(parsed.user);
        try {
          const fresh = await getMe();
          if (!cancelled) setMe(fresh);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            await clearSession();
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await apiLogin({ email, password });
      await applySession(session);
      const fresh = await getMe();
      setMe(fresh);
    },
    [applySession],
  );

  const signUp = useCallback(
    async (input: { email: string; password: string; name?: string }) => {
      const session = await apiSignup({
        email: input.email,
        password: input.password,
        name: input.name ?? null,
      });
      await applySession(session);
      const fresh = await getMe();
      setMe(fresh);
    },
    [applySession],
  );

  const setAcademicOption = useCallback(async (option: AcademicOption) => {
    const settings = await updateAcademicOption(option);
    setMe((prev) => (prev ? { ...prev, settings } : prev));
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (tokenRef.current) await apiLogout();
    } catch {
      // 서버가 이미 무효화 했더라도 로컬 세션은 비운다.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo<SessionContextValue>(
    () => ({ ready, token, user, me, signIn, signUp, signOut, setAcademicOption }),
    [ready, token, user, me, signIn, signUp, signOut, setAcademicOption],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
