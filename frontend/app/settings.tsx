import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <AppHeader
        title="Setting"
        onLeftPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
