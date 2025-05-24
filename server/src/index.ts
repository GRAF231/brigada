import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware';
import userRoutes from './routes/userRoutes';

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для загруженных изображений и документов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Базовый маршрут
app.get('/', (req: Request, res: Response) => {
  res.send('API работает');
});

// Маршруты API
app.use('/api/users', userRoutes);
// TODO: Добавить остальные маршруты
// app.use('/api/projects', projectRoutes);
// app.use('/api/estimates', estimateRoutes);
// app.use('/api/schedules', scheduleRoutes);
// app.use('/api/status', statusRoutes);

// Middleware для обработки ошибок
app.use(notFound);
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен в ${process.env.NODE_ENV} режиме на порту ${PORT}`);
});