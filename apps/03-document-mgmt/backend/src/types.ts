export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: string;
}

export type Permission = 'view' | 'edit' | 'admin';

export interface ShareEntry {
  userId: string;
  permission: Permission;
}

export interface DocumentVersion {
  version: number;
  filename: string;
  storedAs: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  comment: string;
}

export interface Document {
  id: string;
  name: string;
  folderId: string | null;
  ownerId: string;
  tags: string[];
  shares: ShareEntry[];
  versions: DocumentVersion[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  userId: string;
}
