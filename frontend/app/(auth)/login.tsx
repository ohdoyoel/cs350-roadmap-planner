import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/lib/locale/LocaleContext';
import { useSession } from '@/lib/session/SessionContext';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function LoginScreen() {
  const { tokens } = useTheme();
  const { t } = useLocale();
  const { signIn } = useSession();
  const [values, setValues] = useState<Record<string, string>>({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!values.email || !values.password) {
      setError(t('이메일과 비밀번호를 입력해주세요.', 'Enter your email and password.'));
      return;
    }
    setSubmitting(true);
    try {
      await signIn(values.email.trim(), values.password);
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
      title={t('다시 만나서 반가워요', 'Welcome back')}
      subtitle={t(
        'KAIST 이메일로 로그인하고 로드맵을 이어서 계획하세요.',
        'Sign in with your KAIST email to continue planning.',
      )}
      fields={[
        {
          key: 'email',
          label: t('KAIST 이메일', 'KAIST Email'),
          placeholder: 'student@kaist.ac.kr',
          keyboardType: 'email-address',
        },
        {
          key: 'password',
          label: t('비밀번호', 'Password'),
          placeholder: t('비밀번호', 'Password'),
          secure: true,
        },
      ]}
      values={values}
      onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
      submitLabel={t('로그인', 'Log in')}
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={error}
      footer={
        <Link href="/(auth)/signup" replace asChild>
          <Text style={linkStyle}>
            {t('아직 계정이 없어요 — 회원가입', "Don't have an account — Sign up")}
          </Text>
        </Link>
      }
    />
  );
}

function messageFor(err: unknown, t: (ko: string, en: string) => string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return t('이메일 또는 비밀번호가 올바르지 않습니다.', 'Invalid email or password.');
    if (err.status === 422) return t('KAIST 이메일 형식이 아니에요.', 'Not a valid KAIST email format.');
  }
  return t('로그인 중 문제가 발생했어요. 다시 시도해주세요.', 'Login failed. Please try again.');
}

const styles = StyleSheet.create({
  link: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
