import { Request, Response, NextFunction } from 'express';

// Интерфейс для расширенной ошибки
interface ExtendedError extends Error {
  statusCode?: number;
}

// Middleware для обработки ошибок
export const errorHandler = (err: ExtendedError, req: Request, res: Response, next: NextFunction) => {
  // Если статус ответа не установлен, устанавливаем 500 (внутренняя ошибка сервера)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Отправляем ответ с сообщением об ошибке и стеком вызовов (только в режиме разработки)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Middleware для обработки несуществующих маршрутов
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Не найдено - ${req.originalUrl}`);
  res.status(404);
  next(error);
};