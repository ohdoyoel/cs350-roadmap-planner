import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api/client';
import { useSession } from '@/lib/session/SessionContext';

export default function LoginScreen() {
  const { signIn } = useSession();
  const [values, setValues] = useState<Record<string, string>>({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!values.email || !values.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(values.email.trim(), values.password);
      router.replace('/');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="KAIST 이메일로 로그인하고 로드맵을 이어서 계획하세요."
      fields={[
        {
          key: 'email',
          label: 'KAIST Email',
          placeholder: 'student@kaist.ac.kr',
          keyboardType: 'email-address',
        },
        {
          key: 'password',
          label: 'Password',
          placeholder: '비밀번호',
          secure: true,
        },
      ]}
      values={values}
      onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
      submitLabel="Log in"
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={error}
      footer={
        <Link href="/(auth)/signup" replace asChild>
          <Text style={styles.link}>아직 계정이 없어요 — 회원가입</Text>
        </Link>
      }
    />
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (err.status === 422) return 'KAIST 이메일 형식이 아니에요.';
  }
  return '로그인 중 문제가 발생했어요. 다시 시도해주세요.';
}

const styles = StyleSheet.create({
  link: {
    fontFamily: 'Georgia',
    fontSize: 13,
    color: '#111',
    textDecorationLine: 'underline',
  },
});
