import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';

// Расширяем интерфейс Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Интерфейс для JWT payload
interface JwtPayload {
  id: string;
}

// Middleware для проверки аутентификации
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Проверяем наличие токена в заголовке Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Получаем пользователя из базы данных (без пароля)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Не авторизован, токен недействителен');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Не авторизован, токен отсутствует');
  }
};

// Middleware для проверки роли пользователя
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Не авторизован');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403);
      throw new Error('Нет доступа');
    }

    next();
  };
};