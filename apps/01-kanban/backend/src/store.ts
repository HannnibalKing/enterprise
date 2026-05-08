import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { User, Board, Column, Card } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory store — replace with Postgres/SQLite adapter for production
// ─────────────────────────────────────────────────────────────────────────────

export const users: Map<string, User> = new Map();
export const boards: Map<string, Board> = new Map();
export const columns: Map<string, Column> = new Map();
export const cards: Map<string, Card> = new Map();

// ─── Seed data ────────────────────────────────────────────────────────────────

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const alice: User = {
    id: 'user-alice',
    email: 'alice@enterprise.dev',
    name: 'Alice Chen',
    passwordHash,
    avatar: 'AC',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  const bob: User = {
    id: 'user-bob',
    email: 'bob@enterprise.dev',
    name: 'Bob Torres',
    passwordHash,
    avatar: 'BT',
    role: 'member',
    createdAt: new Date().toISOString(),
  };
  const carol: User = {
    id: 'user-carol',
    email: 'carol@enterprise.dev',
    name: 'Carol Singh',
    passwordHash,
    avatar: 'CS',
    role: 'member',
    createdAt: new Date().toISOString(),
  };

  users.set(alice.id, alice);
  users.set(bob.id, bob);
  users.set(carol.id, carol);

  const board: Board = {
    id: 'board-main',
    title: 'Enterprise Platform',
    description: 'Main development board',
    ownerId: alice.id,
    memberIds: [alice.id, bob.id, carol.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  boards.set(board.id, board);

  const cols: Column[] = [
    { id: 'col-backlog',     boardId: board.id, title: 'Backlog',     color: '#6e7681', order: 0, wipLimit: null, createdAt: new Date().toISOString() },
    { id: 'col-todo',        boardId: board.id, title: 'To Do',       color: '#388bfd', order: 1, wipLimit: null, createdAt: new Date().toISOString() },
    { id: 'col-inprogress',  boardId: board.id, title: 'In Progress', color: '#d29922', order: 2, wipLimit: 3,    createdAt: new Date().toISOString() },
    { id: 'col-review',      boardId: board.id, title: 'In Review',   color: '#a371f7', order: 3, wipLimit: null, createdAt: new Date().toISOString() },
    { id: 'col-done',        boardId: board.id, title: 'Done',        color: '#3fb950', order: 4, wipLimit: null, createdAt: new Date().toISOString() },
  ];
  cols.forEach((c) => columns.set(c.id, c));

  const cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { columnId: 'col-backlog',    boardId: board.id, title: 'Set up CI/CD pipeline',          description: 'Configure GitHub Actions for automated builds and deployments.', assigneeId: null,        reporterId: alice.id, priority: 'HIGH',   labels: ['infra', 'devops'],  dueDate: null,        order: 0, checklist: [] },
    { columnId: 'col-backlog',    boardId: board.id, title: 'Design system audit',             description: 'Review all UI components for consistency with the design system.', assigneeId: carol.id,    reporterId: alice.id, priority: 'LOW',    labels: ['design'],           dueDate: null,        order: 1, checklist: [] },
    { columnId: 'col-todo',       boardId: board.id, title: 'Implement OAuth2 login',          description: 'Add Google and GitHub OAuth2 providers to the auth service.', assigneeId: bob.id,      reporterId: alice.id, priority: 'HIGH',   labels: ['auth', 'backend'],  dueDate: '2026-05-15', order: 0, checklist: [{ id: uuid(), text: 'Set up OAuth app credentials', done: true }, { id: uuid(), text: 'Implement callback handler', done: false }] },
    { columnId: 'col-todo',       boardId: board.id, title: 'Add pagination to tables',       description: 'All data tables need server-side pagination with cursor support.', assigneeId: carol.id,    reporterId: bob.id,   priority: 'MEDIUM', labels: ['frontend'],         dueDate: '2026-05-20', order: 1, checklist: [] },
    { columnId: 'col-inprogress', boardId: board.id, title: 'Real-time notifications',        description: 'WebSocket-based notifications for mentions, assignments, and due dates.', assigneeId: alice.id,    reporterId: alice.id, priority: 'URGENT', labels: ['backend', 'ws'],    dueDate: '2026-05-10', order: 0, checklist: [{ id: uuid(), text: 'Design event schema', done: true }, { id: uuid(), text: 'Implement WS server', done: true }, { id: uuid(), text: 'Frontend toast UI', done: false }] },
    { columnId: 'col-inprogress', boardId: board.id, title: 'File upload with preview',       description: 'Drag-and-drop file upload with thumbnail preview and progress bar.', assigneeId: carol.id,    reporterId: bob.id,   priority: 'MEDIUM', labels: ['frontend', 'files'], dueDate: '2026-05-12', order: 1, checklist: [] },
    { columnId: 'col-review',     boardId: board.id, title: 'Role-based access control',      description: 'RBAC middleware for all API routes with permission matrix.', assigneeId: bob.id,      reporterId: alice.id, priority: 'HIGH',   labels: ['auth', 'backend'],  dueDate: '2026-05-08', order: 0, checklist: [] },
    { columnId: 'col-done',       boardId: board.id, title: 'Project scaffolding',             description: 'Initial monorepo setup with workspaces, TypeScript, and ESLint.', assigneeId: alice.id,    reporterId: alice.id, priority: 'HIGH',   labels: ['infra'],            dueDate: null,        order: 0, checklist: [] },
    { columnId: 'col-done',       boardId: board.id, title: 'Database schema v1',              description: 'Initial Postgres schema with users, orgs, boards, and cards tables.', assigneeId: bob.id,      reporterId: alice.id, priority: 'HIGH',   labels: ['backend', 'db'],   dueDate: null,        order: 1, checklist: [] },
  ];

  cardData.forEach((c) => {
    const id = uuid();
    const now = new Date().toISOString();
    cards.set(id, { ...c, id, createdAt: now, updatedAt: now });
  });
}

seed().catch(console.error);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getColumnCards(columnId: string): Card[] {
  return [...cards.values()]
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}

export function getBoardColumns(boardId: string): Column[] {
  return [...columns.values()]
    .filter((c) => c.boardId === boardId)
    .sort((a, b) => a.order - b.order);
}

export function getUserByEmail(email: string): User | undefined {
  return [...users.values()].find((u) => u.email === email);
}

export function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}
