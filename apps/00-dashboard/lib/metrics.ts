import {
  DashboardMetrics,
  KanbanMetrics,
  HrMetrics,
  DocMetrics,
  NotifMetrics,
  ServiceHealth,
} from './types';

// Token cache — module-level, stable per server process
const tokenCache = new Map<string, { token: string; expires: number }>();

const BACKENDS = {
  kanban:        { url: 'http://localhost:4001', email: 'alice@enterprise.dev', password: 'password123' },
  hr:            { url: 'http://localhost:4002', email: 'carol@company.com',    password: 'password123' },
  docs:          { url: 'http://localhost:4003', email: 'alice@docs.com',       password: 'password123' },
  notifications: { url: 'http://localhost:4004', email: 'alice@notify.com',     password: 'password123' },
} as const;

type BackendKey = keyof typeof BACKENDS;

async function getToken(key: BackendKey): Promise<string | null> {
  const cached = tokenCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.token;
  const { url, email, password } = BACKENDS[key];
  try {
    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = (await res.json()) as { token: string };
    tokenCache.set(key, { token, expires: Date.now() + 20 * 3_600_000 });
    return token;
  } catch {
    return null;
  }
}

async function fetchAuth<T>(key: BackendKey, path: string): Promise<T | null> {
  const token = await getToken(key);
  if (!token) return null;
  try {
    const res = await fetch(`${BACKENDS[key].url}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (res.status === 401) { tokenCache.delete(key); return null; }
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function checkHealth(key: BackendKey): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const res = await fetch(`${BACKENDS[key].url}/health`, {
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    return { ok: res.ok, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    boardData,
    employees,
    departments,
    leaveRequests,
    documents,
    folders,
    notifList,
    ruleList,
    hKanban,
    hHr,
    hDocs,
    hNotif,
  ] = await Promise.all([
    fetchAuth<{ columns: Array<{ title: string; cards: unknown[] }> }>('kanban', '/api/boards/board-main'),
    fetchAuth<Array<{ departmentId: string; status: string }>>('hr', '/api/employees'),
    fetchAuth<Array<{ id: string; name: string }>>('hr', '/api/departments'),
    fetchAuth<Array<{ status: string }>>('hr', '/api/leave'),
    fetchAuth<Array<{ id: string }>>('docs', '/api/documents'),
    fetchAuth<Array<{ id: string }>>('docs', '/api/folders'),
    fetchAuth<Array<{ channel: string; priority: string; readBy: string[] }>>('notifications', '/api/notifications'),
    fetchAuth<Array<{ enabled: boolean }>>('notifications', '/api/rules'),
    checkHealth('kanban'),
    checkHealth('hr'),
    checkHealth('docs'),
    checkHealth('notifications'),
  ]);

  // Kanban
  const kanban: KanbanMetrics | null = boardData
    ? {
        totalCards: boardData.columns.reduce((s, c) => s + c.cards.length, 0),
        inProgress: boardData.columns.find((c) => c.title === 'In Progress')?.cards.length ?? 0,
        done: boardData.columns.find((c) => c.title === 'Done')?.cards.length ?? 0,
        cardsByColumn: boardData.columns.map((c) => ({ name: c.title, count: c.cards.length })),
      }
    : null;

  // HR
  const deptMap: Record<string, string> = Object.fromEntries(
    (departments ?? []).map((d) => [d.id, d.name])
  );
  const hr: HrMetrics | null = employees
    ? {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === 'active').length,
        onLeave: employees.filter((e) => e.status === 'on_leave').length,
        pendingLeaves: (leaveRequests ?? []).filter((l) => l.status === 'pending').length,
        byDepartment: Object.entries(
          employees.reduce<Record<string, number>>((acc, e) => {
            const name = deptMap[e.departmentId] ?? 'Unknown';
            acc[name] = (acc[name] ?? 0) + 1;
            return acc;
          }, {})
        )
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      }
    : null;

  // Docs
  const docs: DocMetrics | null = documents
    ? { totalDocuments: documents.length, totalFolders: folders?.length ?? 0 }
    : null;

  // Notifications
  const notifications: NotifMetrics | null = notifList
    ? {
        total: notifList.length,
        unread: notifList.filter((n) => n.readBy.length === 0).length,
        activeRules: (ruleList ?? []).filter((r) => r.enabled).length,
        byChannel: Object.entries(
          notifList.reduce<Record<string, number>>((acc, n) => {
            acc[n.channel] = (acc[n.channel] ?? 0) + 1;
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count })),
        byPriority: Object.entries(
          notifList.reduce<Record<string, number>>((acc, n) => {
            acc[n.priority] = (acc[n.priority] ?? 0) + 1;
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count })),
      }
    : null;

  return {
    kanban,
    hr,
    docs,
    notifications,
    health: { kanban: hKanban, hr: hHr, docs: hDocs, notifications: hNotif },
    fetchedAt: new Date().toISOString(),
  };
}
