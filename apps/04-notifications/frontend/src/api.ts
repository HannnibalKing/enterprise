import { Notification, Rule, User } from './types';

const TOKEN_KEY = 'notif_token';
const BASE = '/api';

function getToken() { return localStorage.getItem(TOKEN_KEY) ?? ''; }
function headers(extra: Record<string, string> = {}) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...extra };
}
async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, opts);
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return undefined as unknown as T;
  return r.json() as Promise<T>;
}

export const api = {
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  login: (email: string, password: string) =>
    req<{ token: string; user: User }>('/auth/login', { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) }),
  me: () => req<User>('/auth/me', { headers: headers() }),

  getNotifications: (params?: { channel?: string; priority?: string; unread?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.channel) q.set('channel', params.channel);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.unread) q.set('unread', 'true');
    return req<Notification[]>(`/notifications${q.toString() ? '?' + q : ''}`, { headers: headers() });
  },
  markRead: (id: string) =>
    req<Notification>(`/notifications/${id}/read`, { method: 'POST', headers: headers() }),
  markAllRead: () =>
    req<{ marked: number }>('/notifications/read-all', { method: 'POST', headers: headers() }),
  deleteNotification: (id: string) =>
    req<void>(`/notifications/${id}`, { method: 'DELETE', headers: headers() }),
  triggerEvent: (event: Record<string, unknown>) =>
    req<{ triggered: number; notifications: Notification[] }>('/notifications/trigger', { method: 'POST', headers: headers(), body: JSON.stringify(event) }),

  getRules: () => req<Rule[]>('/rules', { headers: headers() }),
  getRule: (id: string) => req<Rule>(`/rules/${id}`, { headers: headers() }),
  createRule: (data: Partial<Rule>) =>
    req<Rule>('/rules', { method: 'POST', headers: headers(), body: JSON.stringify(data) }),
  updateRule: (id: string, data: Partial<Rule>) =>
    req<Rule>(`/rules/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }),
  deleteRule: (id: string) =>
    req<void>(`/rules/${id}`, { method: 'DELETE', headers: headers() }),

  getUsers: () => req<User[]>('/users', { headers: headers() }),
  updatePrefs: (prefs: Partial<Record<string, boolean>>) =>
    req<User>('/users/prefs', { method: 'PATCH', headers: headers(), body: JSON.stringify(prefs) }),
};
