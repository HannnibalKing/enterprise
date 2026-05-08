export interface ServiceHealth {
  ok: boolean;
  ms: number;
}

export interface KanbanMetrics {
  totalCards: number;
  inProgress: number;
  done: number;
  cardsByColumn: { name: string; count: number }[];
}

export interface HrMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  pendingLeaves: number;
  byDepartment: { name: string; count: number }[];
}

export interface DocMetrics {
  totalDocuments: number;
  totalFolders: number;
}

export interface NotifMetrics {
  total: number;
  unread: number;
  activeRules: number;
  byChannel: { name: string; count: number }[];
  byPriority: { name: string; count: number }[];
}

export interface DashboardMetrics {
  kanban: KanbanMetrics | null;
  hr: HrMetrics | null;
  docs: DocMetrics | null;
  notifications: NotifMetrics | null;
  health: {
    kanban: ServiceHealth;
    hr: ServiceHealth;
    docs: ServiceHealth;
    notifications: ServiceHealth;
  };
  fetchedAt: string;
}
