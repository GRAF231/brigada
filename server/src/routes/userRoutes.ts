import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  searchUsersByRole
} from '../controllers/userController';
import { protect, authorize } from '../middleware';
import { UserRole } from '../models';

const router = express.Router();

// Публичные маршруты
router.post('/login', authUser);
router.post('/', registerUser);

// Защищенные маршруты (требуют аутентификации)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Маршруты только для менеджеров (НеБригадиров)
router.get('/', protect, authorize(UserRole.MANAGER), getUsers);

// Маршрут для поиска пользователей по роли
router.get('/search', protect, searchUsersByRole);

export default router;