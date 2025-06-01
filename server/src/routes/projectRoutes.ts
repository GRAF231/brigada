import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectUsers,
  addProjectUser
} from '../controllers/projectController';
import { protect, authorize } from '../middleware';
import { UserRole } from '../models';

const router = express.Router();

// Защищенные маршруты (требуют аутентификации)
router.get('/', protect, getProjects);
router.post('/', protect, authorize(UserRole.MANAGER, UserRole.CLIENT), createProject);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, authorize(UserRole.MANAGER), deleteProject);

// Маршруты для работы с участниками проекта
router.get('/:id/users', protect, getProjectUsers);
router.post('/:id/users', protect, authorize(UserRole.MANAGER), addProjectUser);

export default router;