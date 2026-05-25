import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';
import { SidebarOverlay } from '@/components/SidebarOverlay';
import { FocusProvider } from '@/lib/discover/FocusContext';
import { SessionProvider, useSession } from '@/lib/session/SessionContext';
import { SidebarProvider } from '@/lib/sidebar/SidebarContext';
import { CartProvider } from '@/lib/timetable/CartContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PhoneFrame>
          <SessionProvider>
            <FocusProvider>
              <CartProvider>
                <SidebarProvider>
                  <StatusBar style="auto" />
                  <AppGate />
                </SidebarProvider>
              </CartProvider>
            </FocusProvider>
          </SessionProvider>
        </PhoneFrame>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppGate() {
  const { ready, token } = useSession();
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
      <View style={styles.center}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
