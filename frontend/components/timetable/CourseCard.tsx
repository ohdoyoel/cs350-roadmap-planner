import { StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, categoryIdFromKo } from '@/constants/Categories';
import { SUBTOPICS, subtopicIdFromKo } from '@/constants/Subtopics';
import type { ApiCourse } from '@/lib/api/courses';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { TimetableCard } from '@/lib/mocks/timetableFixture';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  card: TimetableCard;
  course?: ApiCourse;
};

export function CourseCard({ card, course }: Props) {
  const { tokens, isDark } = useTheme();
  const { pick, isKo } = useLocale();
  const variant = card.variant ?? 'big';
  const name = course
    ? pick({ ko: course.courseName, en: course.courseNameEn })
    : card.code;
  const categoryId = course ? categoryIdFromKo(course.category) : undefined;
  const categoryLabel = categoryId
    ? (isKo ? CATEGORIES[categoryId].label_ko : CATEGORIES[categoryId].label_en)
    : course?.category ?? '';
  const credit = course?.credit.credit;
  const subtopicIds = (course?.sectors ?? [])
    .map((label) => subtopicIdFromKo(label))
    .filter((id): id is NonNullable<typeof id> => Boolean(id));

  const cardBg = isDark ? tokens.surface : '#fff';
  const cardBorder = tokens.border;

  if (variant === 'small') {
    return (
      <View style={[styles.smallCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={styles.smallHead}>
          <Text style={[styles.smallCode, { color: tokens.text }]}>{card.code}</Text>
          <DotStack subtopicIds={subtopicIds} />
        </View>
        <Text style={[styles.smallName, { color: tokens.subtext }]} numberOfLines={2}>
          {name}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.bigCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.bigHead}>
        <Text style={[styles.bigCode, { color: tokens.text }]}>{card.code}</Text>
        <DotStack subtopicIds={subtopicIds} />
      </View>
      <Text style={[styles.bigName, { color: tokens.subtext }]} numberOfLines={2}>
        {name}
      </Text>
      {categoryLabel ? (
        <Text style={[styles.bigCategory, { color: tokens.subtext }]}>{categoryLabel}</Text>
      ) : null}
      {credit != null ? (
        <Text style={[styles.bigCredit, { color: tokens.subtext }]}>
          {credit}
          {isKo ? '학점' : ' credits'}
        </Text>
      ) : null}
    </View>
  );
}

function DotStack({ subtopicIds }: { subtopicIds: Array<keyof typeof SUBTOPICS> }) {
  if (subtopicIds.length === 0) return null;
  return (
    <View style={styles.dotStack}>
      {subtopicIds.map((id) => (
        <View key={id} style={[styles.dot, { backgroundColor: SUBTOPICS[id].dotColor }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  smallCard: {
    width: 100,
    minHeight: 64,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    overflow: 'hidden',
  },
  smallHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  smallCode: {
    fontSize: 10,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  smallName: {
    fontSize: 10,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    lineHeight: 13,
  },
  bigCard: {
    width: 108,
    minHeight: 82,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    overflow: 'hidden',
  },
  bigHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bigCode: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  bigName: {
    fontSize: 11,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    lineHeight: 14,
  },
  bigCategory: {
    fontSize: 9,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    marginTop: 2,
  },
  bigCredit: {
    fontSize: 9,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
  },
  dotStack: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
