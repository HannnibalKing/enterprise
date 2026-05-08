import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { columns, cards } from '../store';
import { authMiddleware } from '../auth';
import { broadcast } from '../websocket';
import { Column } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/columns?boardId=xxx
router.get('/', (req: Request, res: Response) => {
  const { boardId } = req.query;
  const result = [...columns.values()]
    .filter((c) => !boardId || c.boardId === boardId)
    .sort((a, b) => a.order - b.order);
  res.json(result);
});

// POST /api/columns
router.post('/', (req: Request, res: Response) => {
  const { boardId, title, color = '#6e7681', wipLimit = null } = req.body as Partial<Column>;
  if (!boardId || !title?.trim()) { res.status(400).json({ error: 'boardId and title required' }); return; }

  const existingOrders = [...columns.values()].filter((c) => c.boardId === boardId).map((c) => c.order);
  const order = existingOrders.length ? Math.max(...existingOrders) + 1 : 0;

  const col: Column = { id: uuid(), boardId, title: title.trim(), color: color ?? '#6e7681', order, wipLimit: wipLimit ?? null, createdAt: new Date().toISOString() };
  columns.set(col.id, col);
  broadcast({ type: 'column:created', payload: col });
  res.status(201).json(col);
});

// PATCH /api/columns/:id
router.patch('/:id', (req: Request, res: Response) => {
  const col = columns.get(req.params.id);
  if (!col) { res.status(404).json({ error: 'Column not found' }); return; }
  const { title, color, wipLimit, order } = req.body as Partial<Column>;
  const updated: Column = { ...col, title: title ?? col.title, color: color ?? col.color, wipLimit: wipLimit !== undefined ? wipLimit : col.wipLimit, order: order !== undefined ? order : col.order };
  columns.set(col.id, updated);
  broadcast({ type: 'column:updated', payload: updated });
  res.json(updated);
});

// DELETE /api/columns/:id
router.delete('/:id', (req: Request, res: Response) => {
  const col = columns.get(req.params.id);
  if (!col) { res.status(404).json({ error: 'Column not found' }); return; }
  // Move cards to first column of board
  const firstCol = [...columns.values()].filter((c) => c.boardId === col.boardId && c.id !== col.id).sort((a, b) => a.order - b.order)[0];
  if (firstCol) {
    cards.forEach((card, id) => { if (card.columnId === col.id) cards.set(id, { ...card, columnId: firstCol.id }); });
  } else {
    cards.forEach((card, id) => { if (card.columnId === col.id) cards.delete(id); });
  }
  columns.delete(col.id);
  broadcast({ type: 'column:deleted', payload: { id: col.id, boardId: col.boardId } });
  res.status(204).send();
});

export default router;
