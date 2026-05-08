import { Document, Folder, ShareEntry, User } from './types';

const BASE = '/api';
const token = () => localStorage.getItem('docs_token') ?? '';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error ?? res.statusText); }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

async function upload<T>(method: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method, headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) }, body: formData,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error ?? res.statusText); }
  return res.json();
}

export const api = {
  login: (email: string, password: string) => req<{ token: string; user: User }>('POST', '/auth/login', { email, password }),
  me: () => req<User>('GET', '/auth/me'),

  getUsers: () => req<User[]>('GET', '/users'),

  getFolders: () => req<Folder[]>('GET', '/folders'),
  createFolder: (name: string, parentId?: string) => req<Folder>('POST', '/folders', { name, parentId }),
  renameFolder: (id: string, name: string) => req<Folder>('PATCH', `/folders/${id}`, { name }),
  deleteFolder: (id: string) => req<void>('DELETE', `/folders/${id}`),

  getDocuments: (folderId?: string | null, q?: string) => {
    const params = new URLSearchParams();
    if (folderId !== undefined) params.set('folderId', folderId ?? '');
    if (q) params.set('q', q);
    return req<Document[]>('GET', `/documents?${params}`);
  },
  getDocument: (id: string) => req<Document>('GET', `/documents/${id}`),
  createDocument: (formData: FormData) => upload<Document>('POST', '/documents', formData),
  updateDocument: (id: string, data: Partial<Document>) => req<Document>('PATCH', `/documents/${id}`, data),
  uploadVersion: (id: string, formData: FormData) => upload<unknown>('POST', `/documents/${id}/versions`, formData),
  updateShares: (id: string, shares: ShareEntry[]) => req<Document>('PUT', `/documents/${id}/shares`, { shares }),
  deleteDocument: (id: string) => req<void>('DELETE', `/documents/${id}`),
  searchDocuments: (q: string) => req<Document[]>('GET', `/documents/search?q=${encodeURIComponent(q)}`),
};
