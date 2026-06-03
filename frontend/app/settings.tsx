import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { GradientAvatar } from '@/components/GradientAvatar';
import { AcademicCard } from '@/components/settings/AcademicCard';
import { AcademicPicker } from '@/components/settings/AcademicPicker';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useSession } from '@/lib/session/SessionContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import type { AcademicTrack } from '@/lib/mocks/types';

export default function SettingsScreen() {
  const { tokens, isDark, toggle } = useTheme();
  const { user, me, signOut, setAcademicOption } = useSession();
  const { t, locale, setLocale } = useLocale();
  const [pickerOpen, setPickerOpen] = useState(false);
  const academicTrack = (me?.settings.academicOption as AcademicTrack | undefined) ?? 'major';

  const displayName = user?.name?.trim() || user?.kaistEmail?.split('@')[0] || t('익명', 'Anonymous');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top']}>
      <AppHeader
        title={t('설정', 'Setting')}
        leftIcon="back"
        onLeftPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <View style={styles.body}>
        <View style={[styles.profileCard, { backgroundColor: tokens.surface }]}>
          <GradientAvatar
            seed={user?.kaistEmail ?? user?.id ?? 'anon'}
            size={48}
          />
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: tokens.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: tokens.subtext }]} numberOfLines={1}>
              {user?.kaistEmail ?? ''}
            </Text>
          </View>
        </View>
        <View style={[styles.langRow, { backgroundColor: tokens.surface }]}>
          <Text style={{ ...styles.langLabel, color: tokens.text }}>
            {t('언어', 'Language')}
          </Text>
          <View style={[styles.langGroup, { backgroundColor: isDark ? '#0f0f12' : '#fff' }]}>
            {(['ko', 'en'] as const).map((code) => {
              const active = locale === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => setLocale(code)}
                  accessibilityRole="button"
                  style={{
                    ...styles.langChip,
                    ...(active ? { backgroundColor: '#a78bfa' } : null),
                  }}
                >
                  <Text
                    style={{
                      ...styles.langChipText,
                      color: active ? '#fff' : tokens.subtext,
                    }}
                  >
                    {code === 'ko' ? '한국어' : 'English'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <ToggleRow
          label={t('다크 모드', 'Dark Mode')}
          value={isDark}
          onValueChange={toggle}
        />
        <AcademicCard
          selected={academicTrack}
          onPress={() => setPickerOpen(true)}
        />
        <Pressable
          onPress={() => {
            void signOut();
            router.replace('/');
          }}
          style={({ pressed }) => [
            styles.logoutBtn,
            { borderColor: '#ef4444' },
            pressed && { backgroundColor: isDark ? '#3f1d1d' : '#fee2e2' },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.logoutText}>{t('로그아웃', 'Logout')}</Text>
        </Pressable>
      </View>
      {pickerOpen ? (
        <AcademicPicker
          selectedId={academicTrack}
          onSelect={(id) => {
            setPickerOpen(false);
            void setAcademicOption(id);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 18,
    color: '#fff',
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 16,
  },
  profileEmail: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
  },
  langLabel: {
    fontSize: 18,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  langGroup: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 14,
    gap: 2,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langChipText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  logoutText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 16,
    color: '#ef4444',
  },
});
