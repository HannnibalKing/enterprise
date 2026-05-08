const BASE = '/api';

function getToken(): string {
  return localStorage.getItem('kanban_token') ?? '';
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: import('./types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<import('./types').User>('/auth/me'),

  // Boards
  getBoard: (id: string) => request<import('./types').Board>(`/boards/${id}`),
  getBoards: () => request<import('./types').Board[]>('/boards'),
  createBoard: (title: string, description?: string) =>
    request<import('./types').Board>('/boards', { method: 'POST', body: JSON.stringify({ title, description }) }),

  // Columns
  createColumn: (boardId: string, title: string, color?: string) =>
    request<import('./types').Column>('/columns', { method: 'POST', body: JSON.stringify({ boardId, title, color }) }),
  updateColumn: (id: string, data: Partial<import('./types').Column>) =>
    request<import('./types').Column>(`/columns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteColumn: (id: string) =>
    request<void>(`/columns/${id}`, { method: 'DELETE' }),

  // Cards
  createCard: (data: { columnId: string; boardId: string; title: string; description?: string; priority?: string; assigneeId?: string | null; dueDate?: string | null; labels?: string[] }) =>
    request<import('./types').Card>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: Partial<import('./types').Card>) =>
    request<import('./types').Card>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id: string) =>
    request<void>(`/cards/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request<import('./types').User[]>('/users'),
};
