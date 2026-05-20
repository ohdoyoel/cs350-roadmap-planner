import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';
import { SidebarOverlay } from '@/components/SidebarOverlay';
import { FocusProvider } from '@/lib/discover/FocusContext';
import { SidebarProvider } from '@/lib/sidebar/SidebarContext';
import { CartProvider } from '@/lib/timetable/CartContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PhoneFrame>
          <FocusProvider>
            <CartProvider>
              <SidebarProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }} />
                <SidebarOverlay />
              </SidebarProvider>
            </CartProvider>
          </FocusProvider>
        </PhoneFrame>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
