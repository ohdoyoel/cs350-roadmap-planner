import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api/client';
import { resendVerification } from '@/lib/api/auth';
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
  const [sentTo, setSentTo] = useState<string | null>(null);

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
      const email = values.email.trim();
      await signUp({
        email,
        password: values.password,
        name: values.name?.trim() || undefined,
      });
      setSentTo(email);
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

  if (sentTo) {
    return <VerificationSent email={sentTo} linkStyle={linkStyle} />;
  }

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

function VerificationSent({
  email,
  linkStyle,
}: {
  email: string;
  linkStyle: { color: string };
}) {
  const { tokens } = useTheme();
  const { t } = useLocale();
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleResend = async () => {
    setNotice(null);
    setResending(true);
    try {
      await resendVerification(email);
      setNotice(t('인증 메일을 다시 보냈어요.', 'Verification email sent again.'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNotice(t('이미 인증된 이메일이에요. 로그인해주세요.', 'Already verified — please log in.'));
      } else {
        setNotice(t('메일 재전송에 실패했어요. 잠시 후 다시 시도해주세요.', 'Could not resend. Try again later.'));
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={['top', 'bottom']}>
      <View style={styles.sentBody}>
        <Text style={{ ...styles.brand, color: tokens.subtext }}>Roadmap Planner</Text>
        <Text style={{ ...styles.title, color: tokens.text }}>
          {t('메일함을 확인하세요', 'Check your inbox')}
        </Text>
        <Text style={{ ...styles.subtitle, color: tokens.subtext }}>
          {t(
            `${email}로 인증 메일을 보냈어요. 메일의 링크를 눌러 인증을 마친 뒤 로그인해주세요.`,
            `We sent a verification link to ${email}. Open it to verify, then log in.`,
          )}
        </Text>

        {notice ? (
          <Text style={{ ...styles.notice, color: tokens.subtext }}>{notice}</Text>
        ) : null}

        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
          style={{ ...styles.resend, opacity: resending ? 0.5 : 1 }}
        >
          <Text style={{ ...styles.link, color: tokens.text }}>
            {t('인증 메일 다시 보내기', 'Resend verification email')}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Link href="/(auth)/login" replace asChild>
            <Text style={linkStyle}>{t('로그인하러 가기', 'Go to log in')}</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
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
  sentBody: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
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
    marginTop: 12,
    lineHeight: 20,
  },
  notice: {
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontSize: 12,
    marginTop: 20,
  },
  resend: {
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  footer: {
    marginTop: 28,
    alignItems: 'flex-start',
  },
});
