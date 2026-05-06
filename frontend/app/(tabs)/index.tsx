import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';

export default function Discover() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <AppHeader title="Discover" onLeftPress={() => router.push('/settings')} />
      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
