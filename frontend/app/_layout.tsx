import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';
import { SidebarOverlay } from '@/components/SidebarOverlay';
import { FocusProvider } from '@/lib/discover/FocusContext';
import { LocaleProvider } from '@/lib/locale/LocaleContext';
import { SessionProvider, useSession } from '@/lib/session/SessionContext';
import { SidebarProvider } from '@/lib/sidebar/SidebarContext';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { CartProvider } from '@/lib/timetable/CartContext';

// 한글 폰트: Pretendard. Latin 글리프는 fontFamily chain 의 앞 폰트(Georgia) 가 처리하고,
// Korean 처럼 Georgia 가 못 가진 글리프는 자동으로 Pretendard 로 fallback.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const PRETENDARD_HREF =
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
  if (!document.querySelector(`link[href="${PRETENDARD_HREF}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = PRETENDARD_HREF;
    document.head.appendChild(link);
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <LocaleProvider>
            <PhoneFrame>
              <SessionProvider>
                <FocusProvider>
                  <CartProvider>
                    <SidebarProvider>
                      <ThemedStatusBar />
                      <AppGate />
                    </SidebarProvider>
                  </CartProvider>
                </FocusProvider>
              </SessionProvider>
            </PhoneFrame>
          </LocaleProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function AppGate() {
  const { ready, token } = useSession();
  const { tokens } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [ready, token, segments, router]);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: tokens.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {token ? <SidebarOverlay /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
