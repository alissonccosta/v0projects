import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import logRoutes from './routes/logRoutes';
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import auditRoutes from './routes/auditRoutes';
import logMiddleware from './middlewares/logMiddleware';
import db from './services/db';
import projectRoutes from './routes/projectRoutes';
import activityRoutes from './routes/activityRoutes';
import personRoutes from './routes/personRoutes';
import timeRoutes from './routes/timeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));
app.use(bodyParser.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(logMiddleware);
}

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/atividades', activityRoutes);
app.use('/api/pessoas', personRoutes);
app.use('/api/times', timeRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/perfis', profileRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/logs', logRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  db.query('SELECT 1').catch(err => console.error('DB connection error', err));
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;
