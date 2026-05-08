import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { departments, employees } from '../store';
import { authMiddleware, requireRole } from '../auth';
import { Department } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/departments
router.get('/', (_req, res) => {
  res.json([...departments.values()]);
});

// GET /api/departments/:id
router.get('/:id', (req, res) => {
  const dept = departments.get(req.params.id);
  if (!dept) { res.status(404).json({ error: 'Not found' }); return; }
  const members = [...employees.values()].filter((e) => e.departmentId === req.params.id);
  res.json({ ...dept, members });
});

// POST /api/departments  (hr_admin only)
router.post('/', requireRole('hr_admin'), (req, res) => {
  const { name, managerId, parentId } = req.body as Partial<Department>;
  if (!name) { res.status(400).json({ error: 'name required' }); return; }
  const dept: Department = {
    id: uuid(), name, managerId: managerId ?? null, parentId: parentId ?? null,
    headcount: 0, createdAt: new Date().toISOString(),
  };
  departments.set(dept.id, dept);
  res.status(201).json(dept);
});

// PATCH /api/departments/:id (hr_admin only)
router.patch('/:id', requireRole('hr_admin'), (req, res) => {
  const dept = departments.get(req.params.id);
  if (!dept) { res.status(404).json({ error: 'Not found' }); return; }
  const { name, managerId, parentId } = req.body as Partial<Department>;
  const updated = { ...dept, ...(name && { name }), ...(managerId !== undefined && { managerId }), ...(parentId !== undefined && { parentId }) };
  departments.set(dept.id, updated);
  res.json(updated);
});

// DELETE /api/departments/:id (hr_admin only)
router.delete('/:id', requireRole('hr_admin'), (req, res) => {
  if (!departments.has(req.params.id)) { res.status(404).json({ error: 'Not found' }); return; }
  departments.delete(req.params.id);
  res.status(204).send();
});

export default router;
