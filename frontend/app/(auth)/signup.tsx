import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api/client';
import { useSession } from '@/lib/session/SessionContext';

export default function SignupScreen() {
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
      setError('이메일과 비밀번호는 필수입니다.');
      return;
    }
    if (values.password.length < 6) {
      setError('비밀번호는 6자 이상으로 설정해주세요.');
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
      setError(messageFor(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Create your account"
      subtitle="KAIST 이메일로 가입하면 바로 로드맵 작성을 시작할 수 있어요."
      fields={[
        {
          key: 'name',
          label: 'Name (선택)',
          placeholder: '표시 이름',
          autoCapitalize: 'sentences',
        },
        {
          key: 'email',
          label: 'KAIST Email',
          placeholder: 'student@kaist.ac.kr',
          keyboardType: 'email-address',
        },
        {
          key: 'password',
          label: 'Password',
          placeholder: '6자 이상',
          secure: true,
        },
      ]}
      values={values}
      onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
      submitLabel="Sign up"
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={error}
      footer={
        <Link href="/(auth)/login" replace asChild>
          <Text style={styles.link}>이미 계정이 있어요 — 로그인</Text>
        </Link>
      }
    />
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return '이미 가입된 이메일입니다.';
    if (err.status === 422) return 'KAIST 이메일 형식이 아니에요.';
  }
  return '회원가입 중 문제가 발생했어요. 다시 시도해주세요.';
}

const styles = StyleSheet.create({
  link: {
    fontFamily: 'Georgia',
    fontSize: 13,
    color: '#111',
    textDecorationLine: 'underline',
  },
});
