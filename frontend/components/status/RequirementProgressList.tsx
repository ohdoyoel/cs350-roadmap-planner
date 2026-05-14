import { StyleSheet, Text, View } from 'react-native';
import type { RequirementGroup } from '@/lib/mocks/statusFixture';

type Props = {
  groups: RequirementGroup[];
};

const PALETTE: Record<RequirementGroup['id'], { bg: string; fill: string }> = {
  required_major: { bg: '#ddd6fe', fill: '#8b5cf6' },
  elective_major: { bg: '#fce7f3', fill: '#ec4899' },
  other_requirements: { bg: '#d1fae5', fill: '#10b981' },
  graduation_research: { bg: '#fed7aa', fill: '#f59e0b' },
};

export function RequirementProgressList({ groups }: Props) {
  return (
    <View style={styles.list}>
      {groups.map((group) => {
        const palette = PALETTE[group.id];
        const totalEarned = group.earned + group.planned;
        const ratio = Math.min(1, group.required > 0 ? totalEarned / group.required : 0);
        return (
          <View key={group.id} style={[styles.row, { backgroundColor: palette.bg }]}>
            <View style={styles.header}>
              <Text style={styles.label}>{group.label_en}</Text>
              <Text style={styles.value}>
                {group.earned} / {group.required} credits
                {group.planned > 0 ? ` (+${group.planned})` : ''}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${ratio * 100}%`, backgroundColor: palette.fill },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  value: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#374151',
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
