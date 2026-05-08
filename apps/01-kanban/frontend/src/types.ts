export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
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

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  order: number;
  wipLimit: number | null;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  columns: Column[];
  members: User[];
}
