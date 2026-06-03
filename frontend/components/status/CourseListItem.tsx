import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { CourseListEntry } from '@/lib/mocks/statusFixture';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  entry: CourseListEntry;
  onPress?: (entry: CourseListEntry) => void;
  onDelete?: (entry: CourseListEntry) => void;
};

export function CourseListItem({ entry, onPress, onDelete }: Props) {
  const { tokens, isDark } = useTheme();
  const { t, pick } = useLocale();
  const handlePress = onPress ? () => onPress(entry) : undefined;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={handlePress}
        disabled={!handlePress}
        style={({ pressed }) => [
          styles.body,
          pressed && { backgroundColor: isDark ? tokens.surface : '#f3f4f6' },
        ]}
        accessibilityRole={handlePress ? 'button' : undefined}
        accessibilityLabel={handlePress ? `${entry.code} 성적 변경` : undefined}
      >
        <StatusDot status={entry.status} />
        <Text style={[styles.code, { color: tokens.text }]}>{entry.code}</Text>
        <Text style={[styles.name, { color: tokens.subtext }]} numberOfLines={1}>
          {pick({ ko: entry.name_ko, en: entry.name_en })}
        </Text>
        <View style={styles.tail}>
          {entry.status === 'completed' && entry.grade && entry.gpaPoint != null ? (
            <>
              <Text style={[styles.creditText, { color: tokens.subtext }]}>
                {entry.credit}
                {t('학점', ' credits')}
              </Text>
              <View style={styles.gradePill}>
                <Text style={styles.gradePillText}>
                  {entry.grade} ({entry.gpaPoint.toFixed(1)})
                </Text>
              </View>
            </>
          ) : entry.status === 'planned' ? (
            <View style={styles.plannedPill}>
              <Text style={styles.plannedText}>
                {t('예정', 'Planned')} (+{entry.plannedAddition ?? entry.credit})
              </Text>
            </View>
          ) : (
            <Text style={[styles.creditText, { color: tokens.subtext }]}>
              0 / {entry.credit}
              {t('학점', ' credits')}
            </Text>
          )}
        </View>
      </Pressable>
      {onDelete ? (
        <Pressable
          onPress={() => onDelete(entry)}
          hitSlop={8}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={`${entry.code} 삭제`}
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
        </Pressable>
      ) : null}
    </View>
  );
}

function StatusDot({ status }: { status: CourseListEntry['status'] }) {
  if (status === 'completed') {
    return (
      <View style={[styles.dot, { backgroundColor: '#34d399' }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    );
  }
  if (status === 'planned') {
    return (
      <View style={[styles.dot, { backgroundColor: '#60a5fa' }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    );
  }
  return <View style={[styles.dot, styles.dotNotTaken]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  rowPressed: {
    backgroundColor: '#f3f4f6',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 4,
    borderRadius: 6,
  },
  deleteBtnPressed: {
    backgroundColor: '#fee2e2',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNotTaken: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#f87171',
  },
  code: {
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111827',
    minWidth: 54,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  tail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditText: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#6b7280',
  },
  gradePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  gradePillText: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#dc2626',
  },
  plannedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
  },
  plannedText: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#2563eb',
  },
});
