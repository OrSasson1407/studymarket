import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Axios Interceptor for seamless JWT Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        // Optionally store accessToken in memory/zustand here
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Logout user on refresh failure
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export interface InstitutionalRoute {
  domain: string; institutionName: string; verified: boolean;
}

export async function checkEmailDomain(email: string): Promise<InstitutionalRoute | null> {
  if (!email.includes('@')) return null;
  try {
    const res = await apiClient.get(`${API_BASE_URL}/api/auth/check-domain?email=` + encodeURIComponent(email));
    return res.data;
  } catch {
    return null;
  }
}

export async function registerUser(payload: any) {
  return apiClient.post('/api/auth/register', payload);
}

export async function loginUser(payload: any) {
  return apiClient.post('/api/auth/login', payload);
}