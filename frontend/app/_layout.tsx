import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';
import { SidebarOverlay } from '@/components/SidebarOverlay';
import { SidebarProvider } from '@/lib/sidebar/SidebarContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PhoneFrame>
          <SidebarProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
            <SidebarOverlay />
          </SidebarProvider>
        </PhoneFrame>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
