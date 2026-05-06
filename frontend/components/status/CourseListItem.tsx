import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { CourseListEntry } from '@/lib/mocks/statusFixture';

type Props = {
  entry: CourseListEntry;
};

export function CourseListItem({ entry }: Props) {
  return (
    <View style={styles.row}>
      <StatusDot status={entry.status} />
      <Text style={styles.code}>{entry.code}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {entry.name_en}
      </Text>
      <View style={styles.tail}>
        {entry.status === 'completed' && entry.grade && entry.gpaPoint != null ? (
          <>
            <Text style={styles.creditText}>{entry.credit} credits</Text>
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>
                {entry.grade} ({entry.gpaPoint.toFixed(1)})
              </Text>
            </View>
          </>
        ) : entry.status === 'planned' ? (
          <View style={styles.plannedPill}>
            <Text style={styles.plannedText}>Planned (+{entry.plannedAddition ?? entry.credit})</Text>
          </View>
        ) : (
          <Text style={styles.creditText}>0 / {entry.credit} credits</Text>
        )}
      </View>
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
    paddingVertical: 8,
    gap: 10,
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
    fontFamily: 'Georgia',
    color: '#111827',
    minWidth: 54,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  tail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditText: {
    fontSize: 12,
    fontFamily: 'Georgia',
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
    fontFamily: 'Georgia',
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
    fontFamily: 'Georgia',
    color: '#2563eb',
  },
});
