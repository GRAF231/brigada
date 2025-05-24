import jwt from 'jsonwebtoken';

/**
 * Генерирует JWT токен для пользователя
 * @param id ID пользователя
 * @returns JWT токен
 */
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d', // Токен действителен 30 дней
  });
};

export default generateToken;