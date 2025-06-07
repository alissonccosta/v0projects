import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import logMiddleware from './middlewares/logMiddleware';

const app = express();
app.use(bodyParser.json());
app.use(logMiddleware);

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;
