export type Permission = 'view' | 'edit' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: string;
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

export interface ShareEntry {
  userId: string;
  permission: Permission;
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
