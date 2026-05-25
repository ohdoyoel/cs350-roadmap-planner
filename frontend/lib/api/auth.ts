import { apiGet, apiPost } from './client';

export type ApiUser = {
  id: string;
  name: string | null;
  kaistEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiUserSettings = {
  id: string;
  userId: string;
  language: string;
  theme: string;
  academicOption: string;
  graduationYear: number | null;
};

export type ApiMe = ApiUser & { settings: ApiUserSettings };

export type ApiSession = {
  sessionToken: string;
  tokenType: string;
  expiresAt: string;
  user: ApiUser;
};

export type SignupBody = {
  email: string;
  password: string;
  name?: string | null;
  graduationYear?: number | null;
};

export type LoginBody = {
  email: string;
  password: string;
};

export function signup(body: SignupBody) {
  return apiPost<ApiSession>('/auth/signup', body);
}

export function login(body: LoginBody) {
  return apiPost<ApiSession>('/auth/login', body);
}

export function logout() {
  return apiPost<void>('/auth/logout');
}

export function getMe() {
  return apiGet<ApiMe>('/me');
}
