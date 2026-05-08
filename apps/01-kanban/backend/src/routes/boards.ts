import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { boards, columns, cards, getBoardColumns, sanitizeUser, users } from '../store';
import { authMiddleware } from '../auth';
import { broadcast } from '../websocket';
import { Board } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/boards
router.get('/', (_req: Request, res: Response) => {
  res.json([...boards.values()]);
});

// GET /api/boards/:id  — full board with columns, cards, members
router.get('/:id', (req: Request, res: Response) => {
  const board = boards.get(req.params.id);
  if (!board) { res.status(404).json({ error: 'Board not found' }); return; }

  const boardColumns = getBoardColumns(board.id).map((col) => ({
    ...col,
    cards: [...cards.values()]
      .filter((c) => c.columnId === col.id)
      .sort((a, b) => a.order - b.order),
  }));

  const members = board.memberIds
    .map((id) => users.get(id))
    .filter(Boolean)
    .map((u) => sanitizeUser(u!));

  res.json({ ...board, columns: boardColumns, members });
});

// POST /api/boards
router.post('/', (req: Request, res: Response) => {
  const { title, description = '' } = req.body as { title: string; description?: string };
  if (!title?.trim()) { res.status(400).json({ error: 'title is required' }); return; }

  const user = (req as Request & { user: { userId: string } }).user;
  const now = new Date().toISOString();
  const board: Board = {
    id: uuid(),
    title: title.trim(),
    description,
    ownerId: user.userId,
    memberIds: [user.userId],
    createdAt: now,
    updatedAt: now,
  };
  boards.set(board.id, board);

  // Create default columns
  const defaultCols = ['Backlog', 'To Do', 'In Progress', 'Done'];
  const colors = ['#6e7681', '#388bfd', '#d29922', '#3fb950'];
  defaultCols.forEach((title, i) => {
    const col = { id: uuid(), boardId: board.id, title, color: colors[i], order: i, wipLimit: null, createdAt: now };
    columns.set(col.id, col);
  });

  broadcast({ type: 'board:updated', payload: board });
  res.status(201).json(board);
});

// PATCH /api/boards/:id
router.patch('/:id', (req: Request, res: Response) => {
  const board = boards.get(req.params.id);
  if (!board) { res.status(404).json({ error: 'Board not found' }); return; }
  const { title, description } = req.body as Partial<Board>;
  const updated = { ...board, title: title ?? board.title, description: description ?? board.description, updatedAt: new Date().toISOString() };
  boards.set(board.id, updated);
  broadcast({ type: 'board:updated', payload: updated });
  res.json(updated);
});

export default router;
