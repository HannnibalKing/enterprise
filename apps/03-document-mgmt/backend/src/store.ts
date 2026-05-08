import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Document, DocumentVersion, Folder, Permission, User } from './types';

export const users = new Map<string, User>();
export const folders = new Map<string, Folder>();
export const documents = new Map<string, Document>();

async function seed() {
  const pw = await bcrypt.hash('password123', 10);

  const seedUsers: User[] = [
    { id: 'u-alice', email: 'alice@docs.com', passwordHash: pw, name: 'Alice Chen',    avatar: 'AC' },
    { id: 'u-bob',   email: 'bob@docs.com',   passwordHash: pw, name: 'Bob Torres',   avatar: 'BT' },
    { id: 'u-carol', email: 'carol@docs.com', passwordHash: pw, name: 'Carol Kim',    avatar: 'CK' },
  ];
  seedUsers.forEach((u) => users.set(u.id, u));

  // Folders
  const rootFolders: Folder[] = [
    { id: 'f-root-1', name: 'Engineering', parentId: null, ownerId: 'u-alice', createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 'f-root-2', name: 'HR Documents', parentId: null, ownerId: 'u-carol', createdAt: '2024-01-02T00:00:00.000Z' },
    { id: 'f-root-3', name: 'Marketing',   parentId: null, ownerId: 'u-bob',   createdAt: '2024-01-03T00:00:00.000Z' },
  ];
  const subFolders: Folder[] = [
    { id: 'f-sub-1', name: 'Architecture', parentId: 'f-root-1', ownerId: 'u-alice', createdAt: '2024-02-01T00:00:00.000Z' },
    { id: 'f-sub-2', name: 'API Specs',    parentId: 'f-root-1', ownerId: 'u-alice', createdAt: '2024-02-05T00:00:00.000Z' },
    { id: 'f-sub-3', name: 'Policies',     parentId: 'f-root-2', ownerId: 'u-carol', createdAt: '2024-03-01T00:00:00.000Z' },
  ];
  [...rootFolders, ...subFolders].forEach((f) => folders.set(f.id, f));

  // Documents with version history
  const makeVersion = (n: number, filename: string, userId: string): DocumentVersion => ({
    version: n, filename, storedAs: `${uuid()}.bin`, mimeType: 'application/pdf',
    size: Math.floor(Math.random() * 500000 + 10000), uploadedBy: userId,
    uploadedAt: new Date(Date.now() - (5 - n) * 86400000 * 3).toISOString(), comment: `Version ${n}`,
  });

  const seedDocs: Document[] = [
    {
      id: 'd-1', name: 'System Architecture v2.pdf', folderId: 'f-sub-1', ownerId: 'u-alice',
      tags: ['architecture', 'engineering'], shares: [{ userId: 'u-bob', permission: 'view' }],
      versions: [makeVersion(1, 'architecture_v1.pdf', 'u-alice'), makeVersion(2, 'architecture_v2.pdf', 'u-alice')],
      currentVersion: 2, createdAt: '2024-06-01T00:00:00.000Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'd-2', name: 'API Contract Spec.yaml', folderId: 'f-sub-2', ownerId: 'u-alice',
      tags: ['api', 'spec'], shares: [{ userId: 'u-bob', permission: 'edit' }, { userId: 'u-carol', permission: 'view' }],
      versions: [makeVersion(1, 'api_spec_v1.yaml', 'u-alice'), makeVersion(2, 'api_spec_v2.yaml', 'u-bob'), makeVersion(3, 'api_spec_v3.yaml', 'u-alice')],
      currentVersion: 3, createdAt: '2024-07-10T00:00:00.000Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'd-3', name: 'Employee Handbook 2025.pdf', folderId: 'f-sub-3', ownerId: 'u-carol',
      tags: ['hr', 'policy'], shares: [{ userId: 'u-alice', permission: 'view' }, { userId: 'u-bob', permission: 'view' }],
      versions: [makeVersion(1, 'handbook_2024.pdf', 'u-carol'), makeVersion(2, 'handbook_2025.pdf', 'u-carol')],
      currentVersion: 2, createdAt: '2025-01-10T00:00:00.000Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'd-4', name: 'Q3 Marketing Plan.pptx', folderId: 'f-root-3', ownerId: 'u-bob',
      tags: ['marketing', 'q3'], shares: [],
      versions: [makeVersion(1, 'q3_plan.pptx', 'u-bob')],
      currentVersion: 1, createdAt: '2025-07-01T00:00:00.000Z', updatedAt: new Date().toISOString(),
    },
  ];
  seedDocs.forEach((d) => documents.set(d.id, d));
}

seed().catch(console.error);

export function getUserByEmail(email: string): User | undefined {
  return [...users.values()].find((u) => u.email === email);
}

export function canAccess(doc: Document, userId: string, required: Permission = 'view'): boolean {
  if (doc.ownerId === userId) return true;
  const entry = doc.shares.find((s) => s.userId === userId);
  if (!entry) return false;
  const order: Permission[] = ['view', 'edit', 'admin'];
  return order.indexOf(entry.permission) >= order.indexOf(required);
}
