export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  order: number;
  wipLimit: number | null;
  createdAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  reporterId: string;
  priority: Priority;
  labels: string[];
  dueDate: string | null;
  order: number;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface WsEvent {
  type:
    | 'card:created'
    | 'card:updated'
    | 'card:deleted'
    | 'card:moved'
    | 'column:created'
    | 'column:updated'
    | 'column:deleted'
    | 'board:updated';
  payload: unknown;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}
