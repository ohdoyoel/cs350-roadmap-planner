import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PhoneFrame>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </PhoneFrame>
    </SafeAreaProvider>
  );
}
