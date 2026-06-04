import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { StatSummary } from '@/lib/mocks/statusFixture';

type Props = {
  summary: StatSummary;
};

export function StatTileGrid({ summary }: Props) {
  const { t } = useLocale();
  return (
    <View style={styles.grid}>
      <View style={[styles.tile, { backgroundColor: '#fde6d3' }]}>
        <Text style={styles.label}>{t('이수 학점', 'Earned credits')}</Text>
        <Text style={styles.value}>
          {summary.earnedCredits} / {summary.totalRequiredCredits}
        </Text>
      </View>
      <View style={[styles.tile, { backgroundColor: '#fef3c7' }]}>
        <Text style={styles.label}>{t('수강 예정 학점', 'Planned credits')}</Text>
        <Text style={styles.value}>
          {summary.plannedCredits} (+{summary.plannedAdditionalCredits})
        </Text>
      </View>
      <View style={[styles.tile, { backgroundColor: '#ddd6fe' }]}>
        <Text style={styles.label}>{t('누적 평점', 'Cumulative GPA')}</Text>
        <Text style={styles.value}>{summary.cumulativeGpa.toFixed(2)}</Text>
      </View>
      <View style={[styles.tile, { backgroundColor: '#d1fae5' }]}>
        <Text style={styles.label}>{t('잔여 학점', 'Remaining credits')}</Text>
        <Text style={styles.value}>{summary.remainingCredits}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 64,
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#374151',
  },
  value: {
    fontSize: 18,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    color: '#111827',
  },
});
