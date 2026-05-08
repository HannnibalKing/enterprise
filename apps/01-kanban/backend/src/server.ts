import express from 'express';
import cors from 'cors';
import * as http from 'http';
import { initWebSocket } from './websocket';
import authRouter from './routes/auth';
import boardsRouter from './routes/boards';
import columnsRouter from './routes/columns';
import cardsRouter from './routes/cards';
import { users, sanitizeUser } from './store';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/cards', cardsRouter);

// GET /api/users  (protected — used by assignee picker)
app.get('/api/users', (_req, res) => {
  res.json([...users.values()].map(sanitizeUser));
});

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '4001', 10);
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`\n🟣 Kanban API  →  http://localhost:${PORT}`);
  console.log(`   WebSocket   →  ws://localhost:${PORT}`);
  console.log(`\n   Demo users:`);
  console.log(`     alice@enterprise.dev  /  password123  (admin)`);
  console.log(`     bob@enterprise.dev    /  password123  (member)`);
  console.log(`     carol@enterprise.dev  /  password123  (member)\n`);
});

export default app;
