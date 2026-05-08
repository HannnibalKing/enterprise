import { Router } from 'express';
import { employees } from '../store';
import { authMiddleware } from '../auth';
import { Employee, OrgNode } from '../types';

const router = Router();
router.use(authMiddleware);

function buildTree(managerId: string | null, all: Employee[]): OrgNode[] {
  return all
    .filter((e) => e.managerId === managerId)
    .map((e) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { salary: _, ...safe } = e;
      return { employee: safe, reports: buildTree(e.id, all) };
    });
}

// GET /api/org  — full org tree (salary stripped)
router.get('/', (_req, res) => {
  const all = [...employees.values()];
  const roots = buildTree(null, all);
  res.json(roots);
});

// GET /api/org/:employeeId  — subtree rooted at employee
router.get('/:employeeId', (req, res) => {
  const root = employees.get(req.params.employeeId);
  if (!root) { res.status(404).json({ error: 'Not found' }); return; }
  const all = [...employees.values()];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { salary: _, ...safe } = root;
  const node: OrgNode = { employee: safe, reports: buildTree(root.id, all) };
  res.json(node);
});

export default router;
