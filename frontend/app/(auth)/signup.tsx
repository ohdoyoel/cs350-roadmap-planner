import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useSession } from '@/lib/session/SessionContext';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function SignupScreen() {
  const { tokens } = useTheme();
  const { t } = useLocale();
  const { signUp } = useSession();
  const [values, setValues] = useState<Record<string, string>>({
    email: '',
    password: '',
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!values.email || !values.password) {
      setError(t('이메일과 비밀번호는 필수입니다.', 'Email and password are required.'));
      return;
    }
    if (values.password.length < 8) {
      setError(t('비밀번호는 8자 이상으로 설정해주세요.', 'Password must be at least 8 characters.'));
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim() || undefined,
      });
      router.replace('/');
    } catch (err) {
      setError(messageFor(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  // Link asChild + Text 의 style array 는 RN-Web 0.21 + React 19 에서
  // DOM <a> 로 직접 전달되어 'Cannot set indexed properties' crash 유발.
  // 단일 객체로 flatten 해서 전달.
  const linkStyle = { ...styles.link, color: tokens.text };

  return (
    <AuthForm
      title={t('계정 만들기', 'Create your account')}
      subtitle={t(
        'KAIST 이메일로 가입하면 바로 로드맵 작성을 시작할 수 있어요.',
        'Sign up with your KAIST email to start planning.',
      )}
      fields={[
        {
          key: 'name',
          label: t('이름 (선택)', 'Name (optional)'),
          placeholder: t('표시 이름', 'Display name'),
          autoCapitalize: 'sentences',
        },
        {
          key: 'email',
          label: t('KAIST 이메일', 'KAIST Email'),
          placeholder: 'student@kaist.ac.kr',
          keyboardType: 'email-address',
        },
        {
          key: 'password',
          label: t('비밀번호', 'Password'),
          placeholder: t('8자 이상', '8+ characters'),
          secure: true,
        },
      ]}
      values={values}
      onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
      submitLabel={t('회원가입', 'Sign up')}
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={error}
      footer={
        <Link href="/(auth)/login" replace asChild>
          <Text style={linkStyle}>
            {t('이미 계정이 있어요 — 로그인', 'Already have an account — Log in')}
          </Text>
        </Link>
      }
    />
  );
}

function messageFor(err: unknown, t: (ko: string, en: string) => string): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return t('이미 가입된 이메일입니다.', 'Email is already registered.');
    if (err.status === 422) return t('KAIST 이메일 형식이 아니에요.', 'Not a valid KAIST email format.');
  }
  return t('회원가입 중 문제가 발생했어요. 다시 시도해주세요.', 'Sign up failed. Please try again.');
}

const styles = StyleSheet.create({
  link: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
