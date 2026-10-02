// Auth domain methods. Imported by the lib/api barrel; do not import this
// file directly — use `import { api } from '@/lib/api'` instead.

import { request, requestEnvelope } from './_internal';
import type { AuthProviders, User } from '../api';

export const authApi = {
  getProviders: () => request<AuthProviders>('/auth/providers'),
  getMe: (token: string) => request<User>('/auth/me', { token }),
  getMeWithToken: async (token?: string | null) => {
    const response = await requestEnvelope<User>('/auth/me', token ? { token } : {});
    return {
      user: response.data ?? null,
      token: typeof response.token === 'string' ? response.token : undefined,
    };
  },
  devLogin: async (email: string, name?: string) => {
    try {
      return await request<{ token: string; user: User }>('/auth/dev-login', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      });
    } catch (err) {
      try {
        const res = await fetch('http://localhost:5175/api/auth/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.token && data?.user) {
            return { token: data.token, user: data.user as User };
          }
        }
      } catch {
        // Fall through
      }
      throw err;
    }
  },
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  login: async (email: string, password: string) => {
    try {
      return await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      try {
        const res = await fetch('http://localhost:5175/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.token && data?.user) {
            return { token: data.token, user: data.user as User };
          }
        }
      } catch {
        // Fall through
      }
      throw err;
    }
  },
  requestPasswordReset: (email: string) =>
    request<{ message: string }>('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    }),
  exchangeAuthCode: (code: string) =>
    request<{ token: string; intent?: string; network_type?: 'professional' | 'alumni' }>('/auth/exchange-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
} as const;
