import express from 'express';
import {
  getProjectEstimate,
  createProjectEstimate,
  addEstimateItem,
  updateEstimateItem,
  updateEstimateItemStatus,
  deleteEstimateItem
} from '../controllers/estimateController';
import { protect, authorize } from '../middleware';
import { UserRole } from '../models';

const router = express.Router();

// Маршруты для смет проектов
router.get('/projects/:id/estimate', protect, getProjectEstimate);
router.post('/projects/:id/estimate', protect, authorize(UserRole.MANAGER), createProjectEstimate);

// Маршруты для позиций смет
router.post('/estimates/:id/items', protect, authorize(UserRole.MANAGER), addEstimateItem);
router.put('/estimate-items/:id', protect, authorize(UserRole.MANAGER), updateEstimateItem);
router.patch('/estimate-items/:id/status', protect, updateEstimateItemStatus);
router.delete('/estimate-items/:id', protect, authorize(UserRole.MANAGER), deleteEstimateItem);

export default router;