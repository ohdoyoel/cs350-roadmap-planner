import { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';

export type AuthFieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  secure?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  keyboardType?: 'default' | 'email-address';
};

type Props = {
  title: string;
  subtitle?: string;
  fields: AuthFieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  submitLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
  errorMessage?: string | null;
  footer?: ReactNode;
};

export function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  submitLabel,
  onSubmit,
  submitting,
  errorMessage,
  footer,
}: Props) {
  const { tokens, isDark } = useTheme();
  const { locale, setLocale } = useLocale();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => setLocale('ko')}
              accessibilityRole="button"
              style={{ ...styles.langChip, ...(locale === 'ko' ? { backgroundColor: tokens.text } : {}) }}
            >
              <Text style={{ ...styles.langText, color: locale === 'ko' ? tokens.background : tokens.subtext }}>
                KO
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLocale('en')}
              accessibilityRole="button"
              style={{ ...styles.langChip, ...(locale === 'en' ? { backgroundColor: tokens.text } : {}) }}
            >
              <Text style={{ ...styles.langText, color: locale === 'en' ? tokens.background : tokens.subtext }}>
                EN
              </Text>
            </Pressable>
          </View>
          <Text style={{ ...styles.brand, color: tokens.subtext }}>Roadmap Planner</Text>
          <Text style={{ ...styles.title, color: tokens.text }}>{title}</Text>
          {subtitle ? (
            <Text style={{ ...styles.subtitle, color: tokens.subtext }}>{subtitle}</Text>
          ) : null}
          <View style={styles.form}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={{ ...styles.label, color: tokens.subtext }}>{field.label}</Text>
                <TextInput
                  value={values[field.key] ?? ''}
                  onChangeText={(text) => onChange(field.key, text)}
                  placeholder={field.placeholder}
                  placeholderTextColor={tokens.subtext}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.autoCapitalize ?? 'none'}
                  autoCorrect={false}
                  keyboardType={field.keyboardType ?? 'default'}
                  style={{
                    ...styles.input,
                    color: tokens.text,
                    borderColor: tokens.border,
                    backgroundColor: isDark ? tokens.surface : '#fff',
                  }}
                />
              </View>
            ))}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              style={{
                ...styles.submit,
                backgroundColor: isDark ? '#a78bfa' : '#111',
                ...(submitting ? styles.submitPressed : null),
              }}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitLabel}>{submitLabel}</Text>
              )}
            </Pressable>
          </View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginBottom: 24,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  langText: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 11,
    fontWeight: '600',
  },
  brand: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
    letterSpacing: 1,
  },
  title: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 30,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 13,
    marginTop: 6,
  },
  form: { marginTop: 28, gap: 14 },
  fieldGroup: { gap: 6 },
  label: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
  },
  input: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
    color: '#dc2626',
  },
  submit: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: { opacity: 0.85 },
  submitLabel: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 15,
    color: '#fff',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
});
