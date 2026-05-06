import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';

export default function Timetable() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <AppHeader title="Timetable" onLeftPress={() => router.push('/settings')} />
      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
