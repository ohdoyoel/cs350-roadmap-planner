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
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>Roadmap Planner</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.form}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  value={values[field.key] ?? ''}
                  onChangeText={(text) => onChange(field.key, text)}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={field.secure}
                  autoCapitalize={field.autoCapitalize ?? 'none'}
                  autoCorrect={false}
                  keyboardType={field.keyboardType ?? 'default'}
                  style={styles.input}
                />
              </View>
            ))}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submit,
                (submitting || pressed) && styles.submitPressed,
              ]}
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
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  body: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 32,
  },
  brand: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#6b7280',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 30,
    color: '#111',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'Georgia',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  form: { marginTop: 28, gap: 14 },
  fieldGroup: { gap: 6 },
  label: {
    fontFamily: 'Georgia',
    fontSize: 12,
    color: '#374151',
  },
  input: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#111',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  error: {
    fontFamily: 'Georgia',
    fontSize: 12,
    color: '#dc2626',
  },
  submit: {
    marginTop: 6,
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: { opacity: 0.85 },
  submitLabel: {
    fontFamily: 'Georgia',
    fontSize: 15,
    color: '#fff',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
});
