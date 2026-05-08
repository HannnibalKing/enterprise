import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { documents, canAccess, users } from '../store';
import { authMiddleware } from '../auth';
import { Document, DocumentVersion, Permission, ShareEntry } from '../types';

const router = Router();
router.use(authMiddleware);

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const fs = require('fs');
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, _file, cb) => cb(null, `${uuid()}.bin`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/documents  — list accessible documents (optional ?folderId=, ?q=, ?tags=)
router.get('/', (req, res) => {
  const userId = req.user!.userId;
  const { folderId, q, tags } = req.query;

  let list = [...documents.values()].filter((d) => canAccess(d, userId));

  if (folderId !== undefined) {
    list = list.filter((d) => d.folderId === (folderId || null));
  }
  if (q) {
    const query = String(q).toLowerCase();
    list = list.filter((d) => d.name.toLowerCase().includes(query) || d.tags.some((t) => t.includes(query)));
  }
  if (tags) {
    const tagList = String(tags).split(',').map((t) => t.trim());
    list = list.filter((d) => tagList.every((t) => d.tags.includes(t)));
  }

  res.json(list.map((d) => ({ ...d, versions: undefined, currentFile: d.versions.find((v) => v.version === d.currentVersion) })));
});

// GET /api/documents/:id
router.get('/:id', (req, res) => {
  const userId = req.user!.userId;
  const doc = documents.get(req.params.id);
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (!canAccess(doc, userId)) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.json(doc);
});

// POST /api/documents  — create document record (optionally with file)
router.post('/', upload.single('file'), (req, res) => {
  const userId = req.user!.userId;
  const { name, folderId, tags, comment } = req.body as { name?: string; folderId?: string; tags?: string; comment?: string };
  if (!name) { res.status(400).json({ error: 'name required' }); return; }

  const now = new Date().toISOString();
  const id = uuid();
  const versions: DocumentVersion[] = [];

  if (req.file) {
    versions.push({
      version: 1,
      filename: req.file.originalname,
      storedAs: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: userId,
      uploadedAt: now,
      comment: comment ?? 'Initial version',
    });
  }

  const doc: Document = {
    id, name, folderId: folderId || null, ownerId: userId,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    shares: [], versions, currentVersion: versions.length > 0 ? 1 : 0,
    createdAt: now, updatedAt: now,
  };
  documents.set(id, doc);
  res.status(201).json(doc);
});

// POST /api/documents/:id/versions  — upload new version
router.post('/:id/versions', upload.single('file'), (req, res) => {
  const userId = req.user!.userId;
  const doc = documents.get(req.params.id);
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (!canAccess(doc, userId, 'edit')) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (!req.file) { res.status(400).json({ error: 'file required' }); return; }

  const nextVersion = doc.currentVersion + 1;
  const newVer: DocumentVersion = {
    version: nextVersion,
    filename: req.file.originalname,
    storedAs: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    comment: req.body.comment ?? '',
  };
  const updated = { ...doc, versions: [...doc.versions, newVer], currentVersion: nextVersion, updatedAt: new Date().toISOString() };
  documents.set(doc.id, updated);
  res.status(201).json(newVer);
});

// PATCH /api/documents/:id  — update name/tags/folderId
router.patch('/:id', (req, res) => {
  const userId = req.user!.userId;
  const doc = documents.get(req.params.id);
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (!canAccess(doc, userId, 'edit')) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { name, tags, folderId } = req.body as Partial<Document>;
  const updated = {
    ...doc,
    ...(name && { name }),
    ...(tags !== undefined && { tags }),
    ...(folderId !== undefined && { folderId }),
    updatedAt: new Date().toISOString(),
  };
  documents.set(doc.id, updated);
  res.json(updated);
});

// PUT /api/documents/:id/shares  — set share list (owner only)
router.put('/:id/shares', (req, res) => {
  const userId = req.user!.userId;
  const doc = documents.get(req.params.id);
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (doc.ownerId !== userId) { res.status(403).json({ error: 'Only owner can share' }); return; }

  const shares = req.body.shares as ShareEntry[];
  if (!Array.isArray(shares)) { res.status(400).json({ error: 'shares must be an array' }); return; }

  const validPermissions: Permission[] = ['view', 'edit', 'admin'];
  for (const s of shares) {
    if (!users.has(s.userId) || !validPermissions.includes(s.permission)) {
      res.status(400).json({ error: `Invalid share entry: ${JSON.stringify(s)}` }); return;
    }
  }
  const updated = { ...doc, shares };
  documents.set(doc.id, updated);
  res.json(updated);
});

// DELETE /api/documents/:id  (owner only)
router.delete('/:id', (req, res) => {
  const userId = req.user!.userId;
  const doc = documents.get(req.params.id);
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (doc.ownerId !== userId) { res.status(403).json({ error: 'Only owner can delete' }); return; }
  documents.delete(req.params.id);
  res.status(204).send();
});

// GET /api/documents/search?q=  — full-text across name + tags
router.get('/search', (req, res) => {
  const userId = req.user!.userId;
  const q = String(req.query.q ?? '').toLowerCase();
  const results = [...documents.values()]
    .filter((d) => canAccess(d, userId) && (d.name.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q))))
    .map((d) => ({ ...d, currentFile: d.versions.find((v) => v.version === d.currentVersion) }));
  res.json(results);
});

export default router;
