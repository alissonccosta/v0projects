import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import logRoutes from './routes/logRoutes';
import logMiddleware from './middlewares/logMiddleware';
import db from './services/db';

const app = express();
app.use(bodyParser.json());
app.use(logMiddleware);

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/logs', logRoutes);

const PORT = process.env.PORT || 4000;
db.query('SELECT 1').catch(err => console.error('DB connection error', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;
