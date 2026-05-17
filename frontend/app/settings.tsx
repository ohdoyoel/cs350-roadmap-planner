import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { AcademicCard } from '@/components/settings/AcademicCard';
import { AcademicPicker } from '@/components/settings/AcademicPicker';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { DEFAULT_SETTINGS } from '@/lib/mocks/settingsFixture';
import type { Settings } from '@/lib/mocks/types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        title="Setting"
        onLeftPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <View style={styles.body}>
        <ToggleRow
          label="Sound"
          value={settings.sound}
          onValueChange={(v) => setSettings((s) => ({ ...s, sound: v }))}
        />
        <ToggleRow
          label="Vibration"
          value={settings.vibration}
          onValueChange={(v) => setSettings((s) => ({ ...s, vibration: v }))}
        />
        <AcademicCard
          selected={settings.academicTrack}
          onPress={() => setPickerOpen(true)}
        />
      </View>
      {pickerOpen ? (
        <AcademicPicker
          selectedId={settings.academicTrack}
          onSelect={(id) => {
            setSettings((s) => ({ ...s, academicTrack: id }));
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
});
