import express from 'express';
import {
  getProjectSchedule,
  createProjectSchedule,
  addScheduleItem,
  updateScheduleItem,
  updateScheduleItemStatus,
  deleteScheduleItem
} from '../controllers/scheduleController';
import { protect, authorize } from '../middleware';
import { UserRole } from '../models';

const router = express.Router();

// Маршруты для графиков работ проектов
router.get('/projects/:id/schedule', protect, getProjectSchedule);
router.post('/projects/:id/schedule', protect, authorize(UserRole.MANAGER), createProjectSchedule);

// Маршруты для работ в графике
router.post('/schedules/:id/items', protect, authorize(UserRole.MANAGER), addScheduleItem);
router.put('/schedule-items/:id', protect, authorize(UserRole.MANAGER), updateScheduleItem);
router.patch('/schedule-items/:id/status', protect, updateScheduleItemStatus);
router.delete('/schedule-items/:id', protect, authorize(UserRole.MANAGER), deleteScheduleItem);

export default router;