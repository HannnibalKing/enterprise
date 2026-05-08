import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import departmentsRouter from './routes/departments';
import employeesRouter from './routes/employees';
import leaveRouter from './routes/leave';
import orgRouter from './routes/org';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4002;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/org', orgRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'hr-portal-backend' }));

app.listen(PORT, () => console.log(`HR Portal backend running on http://localhost:${PORT}`));

export default app;
