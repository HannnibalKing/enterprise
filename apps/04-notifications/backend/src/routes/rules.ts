import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { rules } from '../store';
import { authMiddleware } from '../auth';
import { Rule } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/', (_req, res) => res.json([...rules.values()]));
router.get('/:id', (req, res) => {
  const r = rules.get(req.params.id);
  if (!r) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(r);
});

router.post('/', (req, res) => {
  const data = req.body as Partial<Rule>;
  if (!data.name || !data.actions) { res.status(400).json({ error: 'name and actions required' }); return; }
  const now = new Date().toISOString();
  const rule: Rule = {
    id: uuid(), name: data.name, description: data.description ?? '',
    enabled: data.enabled ?? true, conditionLogic: data.conditionLogic ?? 'AND',
    conditions: data.conditions ?? [], actions: data.actions,
    createdAt: now, updatedAt: now, triggerCount: 0,
  };
  rules.set(rule.id, rule);
  res.status(201).json(rule);
});

router.patch('/:id', (req, res) => {
  const r = rules.get(req.params.id);
  if (!r) { res.status(404).json({ error: 'Not found' }); return; }
  const { name, description, enabled, conditions, conditionLogic, actions } = req.body as Partial<Rule>;
  const updated = {
    ...r,
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(enabled !== undefined && { enabled }),
    ...(conditions !== undefined && { conditions }),
    ...(conditionLogic !== undefined && { conditionLogic }),
    ...(actions !== undefined && { actions }),
    updatedAt: new Date().toISOString(),
  };
  rules.set(r.id, updated);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (!rules.has(req.params.id)) { res.status(404).json({ error: 'Not found' }); return; }
  rules.delete(req.params.id);
  res.status(204).send();
});

export default router;
