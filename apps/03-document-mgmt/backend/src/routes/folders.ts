import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { folders, documents } from '../store';
import { authMiddleware } from '../auth';
import { Folder } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/folders  — tree visible to user
router.get('/', (req, res) => {
  const userId = req.user!.userId;
  // User sees folders they own + folders containing docs they can access
  const accessibleFolderIds = new Set<string>();
  [...documents.values()].forEach((doc) => {
    if (doc.ownerId === userId || doc.shares.some((s) => s.userId === userId)) {
      if (doc.folderId) accessibleFolderIds.add(doc.folderId);
    }
  });
  const result = [...folders.values()].filter((f) => f.ownerId === userId || accessibleFolderIds.has(f.id));
  res.json(result);
});

// POST /api/folders
router.post('/', (req, res) => {
  const { name, parentId } = req.body as Partial<Folder>;
  if (!name) { res.status(400).json({ error: 'name required' }); return; }
  const folder: Folder = {
    id: uuid(), name, parentId: parentId ?? null,
    ownerId: req.user!.userId, createdAt: new Date().toISOString(),
  };
  folders.set(folder.id, folder);
  res.status(201).json(folder);
});

// PATCH /api/folders/:id
router.patch('/:id', (req, res) => {
  const folder = folders.get(req.params.id);
  if (!folder) { res.status(404).json({ error: 'Not found' }); return; }
  if (folder.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Forbidden' }); return; }
  const updated = { ...folder, ...(req.body.name && { name: req.body.name }) };
  folders.set(folder.id, updated);
  res.json(updated);
});

// DELETE /api/folders/:id
router.delete('/:id', (req, res) => {
  const folder = folders.get(req.params.id);
  if (!folder) { res.status(404).json({ error: 'Not found' }); return; }
  if (folder.ownerId !== req.user!.userId) { res.status(403).json({ error: 'Forbidden' }); return; }
  folders.delete(req.params.id);
  res.status(204).send();
});

export default router;
