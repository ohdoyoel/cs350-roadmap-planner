import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { ApiPrerequisiteWarning } from '@/lib/api/roadmap';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  warnings: ApiPrerequisiteWarning[];
  onDismiss: () => void;
  // 자동 dismiss 까지 ms.
  durationMs?: number;
};

export function PrerequisiteWarningAlert({ warnings, onDismiss, durationMs = 2000 }: Props) {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const opacity = useRef(new Animated.Value(0)).current;
  const visible = warnings.length > 0;

  useEffect(() => {
    if (!visible) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDismiss();
      });
    }, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, opacity, onDismiss]);

  if (!visible) return null;

  // 여러 건이면 첫 항목 + "외 N건" 으로 압축.
  const first = warnings[0];
  const extra = warnings.length - 1;
  const message =
    extra > 0
      ? t(
          `${first.courseCode} 추가 — 선수과목 ${first.requiredCourseCode} 미이수 외 ${extra}건`,
          `${first.courseCode} added — missing prereq ${first.requiredCourseCode} (+${extra} more)`,
        )
      : t(
          `${first.courseCode} 추가 — 선수과목 ${first.requiredCourseCode} 미이수`,
          `${first.courseCode} added — missing prereq ${first.requiredCourseCode}`,
        );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { opacity, backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' },
      ]}
    >
      <Ionicons name="warning" size={14} color={isDark ? '#fecaca' : '#b91c1c'} />
      <Text style={[styles.text, { color: isDark ? '#fecaca' : '#b91c1c' }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // CustomTabBar 가 bottom 0 + paddingBottom 16 + height 64 + paddingTop 8 → 약 88, 그 위 8px.
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 50,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
});
