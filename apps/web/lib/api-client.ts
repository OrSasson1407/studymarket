export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface InstitutionalRoute {
  domain: string;
  institutionName: string;
  country: string;
  shortCode: string;
  iconAccent: string;
  verified: boolean;
}

export async function checkEmailDomain(email: string): Promise<InstitutionalRoute | null> {
  if (!email.includes('@')) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/check-domain?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });

  if (!res.ok) return null;
  return res.json();
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, data: await res.json() };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginUser(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return { status: res.status, data: await res.json() };
}
