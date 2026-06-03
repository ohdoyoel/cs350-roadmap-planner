import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AddCustomCourseInput } from '@/lib/timetable/CartContext';
import { useLocale } from '@/lib/locale/LocaleContext';
import type { SemesterOption } from '@/lib/mocks/statusFixture';
import { useTheme } from '@/lib/theme/ThemeContext';

type Props = {
  semesters: SemesterOption[];
  defaultSemester: string;
  onSubmit: (input: AddCustomCourseInput) => Promise<void>;
  onClose: () => void;
};

// 백엔드 CourseCategoryName (Korean Literal).
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: '기초필수', label: 'Basic Required' },
  { value: '기초선택', label: 'Basic Elective' },
  { value: '전공필수', label: 'Major Required' },
  { value: '전공선택', label: 'Major Elective' },
  { value: '졸업연구', label: 'Graduation Research' },
  { value: '기타', label: 'Other' },
];

function generateCourseCode(): string {
  // 사용자가 신경 쓰지 않도록 timestamp 기반 단일 키 생성.
  const stamp = Date.now().toString(36).toUpperCase();
  return `CUSTOM-${stamp}`;
}

export function CustomCourseForm({ semesters, defaultSemester, onSubmit, onClose }: Props) {
  const { tokens, isDark } = useTheme();
  const { t, isKo } = useLocale();
  const CATEGORY_LABEL: Record<string, string> = {
    '기초필수': 'Basic Required',
    '기초선택': 'Basic Elective',
    '전공필수': 'Major Required',
    '전공선택': 'Major Elective',
    '졸업연구': 'Graduation Research',
    '기타': 'Other',
  };
  const [title, setTitle] = useState('');
  const [creditText, setCreditText] = useState('3');
  const [semester, setSemester] = useState(defaultSemester);
  const [category, setCategory] = useState<string>('기타');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const credit = useMemo(() => {
    const n = Number(creditText);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : NaN;
  }, [creditText]);

  const canSubmit = title.trim().length > 0 && Number.isFinite(credit) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        semester,
        courseCode: generateCourseCode(),
        title: title.trim(),
        credit,
        category,
      });
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  };

  const chipBg = isDark ? tokens.surface : '#f3f4f6';
  const inputStyle = {
    borderColor: tokens.border,
    color: tokens.text,
    backgroundColor: isDark ? tokens.surface : 'transparent',
  };
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: tokens.background }]}>
        <View style={[styles.header, { borderBottomColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.text }]}>
            {t('커스텀 과목 추가', 'Add Custom Course')}
          </Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel={t('닫기', 'Close')}>
            <Ionicons name="close" size={18} color={tokens.subtext} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[styles.label, { color: tokens.subtext }]}>{t('제목', 'Title')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('예: 개별연구', 'e.g. Independent Study')}
            placeholderTextColor={tokens.subtext}
            style={[styles.input, inputStyle]}
            autoFocus
          />

          <Text style={[styles.label, { color: tokens.subtext }]}>{t('학점', 'Credit')}</Text>
          <TextInput
            value={creditText}
            onChangeText={setCreditText}
            keyboardType="number-pad"
            placeholder="3"
            placeholderTextColor={tokens.subtext}
            style={[styles.input, inputStyle]}
          />

          <Text style={[styles.label, { color: tokens.subtext }]}>{t('학기', 'Semester')}</Text>
          <View style={styles.choiceRow}>
            {semesters.map((opt) => {
              const active = opt.id === semester;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSemester(opt.id)}
                  style={[styles.chip, { backgroundColor: chipBg }, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : tokens.text }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: tokens.subtext }]}>{t('카테고리', 'Category')}</Text>
          <View style={styles.choiceRow}>
            {CATEGORY_OPTIONS.map((opt) => {
              const active = opt.value === category;
              const labelText = isKo ? opt.value : CATEGORY_LABEL[opt.value] ?? opt.label;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setCategory(opt.value)}
                  style={[styles.chip, { backgroundColor: chipBg }, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : tokens.text }]}>
                    {labelText}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </ScrollView>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[
            styles.submit,
            { backgroundColor: isDark ? '#a78bfa' : '#111' },
            !canSubmit && styles.submitDisabled,
          ]}
        >
          <Text style={styles.submitText}>
            {submitting ? t('추가 중…', 'Adding…') : t('추가', 'Add')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 320,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(0,0,0,0.18)' } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 16,
    color: '#111',
  },
  body: {
    padding: 16,
    gap: 10,
  },
  label: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
    color: '#111',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
  },
  chipActive: {
    backgroundColor: '#a78bfa',
  },
  chipText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
    color: '#374151',
  },
  chipTextActive: {
    color: '#fff',
  },
  errorText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 11,
    color: '#dc2626',
  },
  submit: {
    backgroundColor: '#111',
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
    color: '#fff',
  },
});
