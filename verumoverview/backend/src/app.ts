import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import logRoutes from './routes/logRoutes';
import logMiddleware from './middlewares/logMiddleware';
import db from './services/db';
import projectRoutes from './routes/projectRoutes';
import activityRoutes from './routes/activityRoutes';
import personRoutes from './routes/personRoutes';
import timeRoutes from './routes/timeRoutes';

const app = express();
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
app.use('/logs', logRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  db.query('SELECT 1').catch(err => console.error('DB connection error', err));
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;
