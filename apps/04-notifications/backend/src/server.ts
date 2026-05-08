import express from 'express';
import cors from 'cors';
import http from 'http';
import { initWebSocket } from './websocket';
import authRouter from './routes/auth';
import rulesRouter from './routes/rules';
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.get('/health', (_req, res) => res.json({ ok: true, service: 'notifications', ts: new Date().toISOString() }));

const server = http.createServer(app);
initWebSocket(server);

const PORT = Number(process.env.PORT) || 4004;
server.listen(PORT, () => console.log(`Notifications backend running on http://localhost:${PORT}`));
