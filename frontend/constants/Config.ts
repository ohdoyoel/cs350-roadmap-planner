import { Platform } from 'react-native';

// 로컬 개발에서 백엔드는 `http://localhost:8000` (backend/docker-compose).
// iOS 시뮬레이터/웹은 그대로 사용 가능. Android 에뮬레이터는 `10.0.2.2`로 매핑 필요.
function resolveDefaultApiBase(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
}

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? resolveDefaultApiBase();
