import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { cards, columns } from '../store';
import { authMiddleware } from '../auth';
import { broadcast } from '../websocket';
import { Card, Priority } from '../types';

const router = Router();
router.use(authMiddleware);

type AuthReq = Request & { user: { userId: string } };

// GET /api/cards?boardId=xxx  or  ?columnId=xxx
router.get('/', (req: Request, res: Response) => {
  const { boardId, columnId } = req.query;
  let result = [...cards.values()];
  if (boardId) result = result.filter((c) => c.boardId === boardId);
  if (columnId) result = result.filter((c) => c.columnId === columnId);
  res.json(result.sort((a, b) => a.order - b.order));
});

// GET /api/cards/:id
router.get('/:id', (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  res.json(card);
});

// POST /api/cards
router.post('/', (req: Request, res: Response) => {
  const { columnId, boardId, title, description = '', assigneeId = null, priority = 'MEDIUM', labels = [], dueDate = null } = req.body as Partial<Card>;
  if (!columnId || !boardId || !title?.trim()) {
    res.status(400).json({ error: 'columnId, boardId, and title are required' });
    return;
  }
  if (!columns.has(columnId)) { res.status(400).json({ error: 'Column not found' }); return; }

  const colCards = [...cards.values()].filter((c) => c.columnId === columnId);
  const order = colCards.length ? Math.max(...colCards.map((c) => c.order)) + 1 : 0;

  const now = new Date().toISOString();
  const card: Card = {
    id: uuid(),
    columnId,
    boardId,
    title: title.trim(),
    description,
    assigneeId: assigneeId ?? null,
    reporterId: (req as AuthReq).user.userId,
    priority: (priority as Priority) ?? 'MEDIUM',
    labels: labels ?? [],
    dueDate: dueDate ?? null,
    order,
    checklist: [],
    createdAt: now,
    updatedAt: now,
  };
  cards.set(card.id, card);
  broadcast({ type: 'card:created', payload: card });
  res.status(201).json(card);
});

// PATCH /api/cards/:id — update fields OR move between columns
router.patch('/:id', (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

  const {
    title, description, assigneeId, priority, labels, dueDate, checklist,
    columnId, order,
  } = req.body as Partial<Card>;

  const moved = columnId && columnId !== card.columnId;

  const updated: Card = {
    ...card,
    title: title ?? card.title,
    description: description !== undefined ? description : card.description,
    assigneeId: assigneeId !== undefined ? assigneeId : card.assigneeId,
    priority: (priority as Priority) ?? card.priority,
    labels: labels ?? card.labels,
    dueDate: dueDate !== undefined ? dueDate : card.dueDate,
    checklist: checklist ?? card.checklist,
    columnId: columnId ?? card.columnId,
    order: order !== undefined ? order : card.order,
    updatedAt: new Date().toISOString(),
  };

  // Re-order sibling cards when inserting at a specific position
  if (order !== undefined) {
    const targetColId = columnId ?? card.columnId;
    cards.forEach((c, id) => {
      if (c.id !== card.id && c.columnId === targetColId && c.order >= order) {
        cards.set(id, { ...c, order: c.order + 1 });
      }
    });
  }

  cards.set(card.id, updated);

  if (moved) {
    broadcast({ type: 'card:moved', payload: { cardId: card.id, fromColumnId: card.columnId, toColumnId: columnId, order } });
  } else {
    broadcast({ type: 'card:updated', payload: updated });
  }

  res.json(updated);
});

// DELETE /api/cards/:id
router.delete('/:id', (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
  cards.delete(card.id);
  broadcast({ type: 'card:deleted', payload: { id: card.id, columnId: card.columnId, boardId: card.boardId } });
  res.status(204).send();
});

// GET /api/users — for assignee picker
router.get('/users/all', (_req: Request, res: Response) => {
  const { users, sanitizeUser } = require('../store');
  res.json([...users.values()].map(sanitizeUser));
});

export default router;
