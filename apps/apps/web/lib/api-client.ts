const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:3001';
const API_SERVICE_URL  = process.env.NEXT_PUBLIC_API_SERVICE_URL  ?? 'http://localhost:3002';

// ?? helpers ??????????????????????????????????????????????????????????????????
async function post<T>(base: string, path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',          // sends the HttpOnly refreshToken cookie
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

async function get<T>(base: string, path: string, token?: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

// ?? auth ?????????????????????????????????????????????????????????????????????
export interface RegisterPayload { email: string; name: string; password: string; }
export interface LoginPayload    { email: string; password: string; }
export interface AuthResponse    { accessToken: string; }
export interface RegisterResponse{ message: string; requiresVerification: boolean; }
export interface MfaSetupResponse{ secret: string; otpauthUrl: string; }

export const authApi = {
  register: (payload: RegisterPayload) =>
    post<RegisterResponse>(AUTH_SERVICE_URL, '/api/auth/register', payload),

  login: (payload: LoginPayload) =>
    post<AuthResponse>(AUTH_SERVICE_URL, '/api/auth/login', payload),

  generateMfa: (token: string) =>
    post<MfaSetupResponse>(AUTH_SERVICE_URL, '/api/auth/mfa/generate', {}, token),
};

// ?? documents (content-service stub) ?????????????????????????????????????????
export interface Document {
  id: string; title: string; courseCode: string; courseName: string;
  university: string; faculty: string; semester: string;
  priceAmount: number; compositeRating: number; purchaseCount: number;
  authorName: string; authorVerified: boolean; docType: string;
  featured?: boolean; createdAt: string;
}

export const contentApi = {
  list: (params?: { search?: string; university?: string; docType?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return get<Document[]>(API_SERVICE_URL, `/api/documents${qs ? `?${qs}` : ''}`);
  },
  purchase: (docId: string, token: string) =>
    post<{ success: boolean }>(API_SERVICE_URL, `/api/documents/${docId}/purchase`, {}, token),
};
