import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import foldersRouter from './routes/folders';
import documentsRouter from './routes/documents';
import { users } from './store';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4003;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/documents', documentsRouter);

// GET /api/users  — list all users (for share picker)
app.get('/api/users', (_req, res) => {
  res.json([...users.values()].map((u) => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar })));
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'docmgmt-backend' }));

app.listen(PORT, () => console.log(`Document Management backend running on http://localhost:${PORT}`));

export default app;
