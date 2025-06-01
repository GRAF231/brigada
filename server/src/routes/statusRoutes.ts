import express from 'express';
import {
  getProjectStatusMessages,
  createStatusMessage,
  uploadAttachments,
  deleteStatusMessage,
  getAttachment
} from '../controllers/statusController';
import { protect } from '../middleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Маршруты для статусов проектов
router.get('/projects/:id/status', protect, getProjectStatusMessages);
router.post('/projects/:id/status', protect, createStatusMessage);

// Маршруты для работы с сообщениями о статусе
router.post('/status-messages/:id/attachments', protect, upload.array('files', 5), uploadAttachments);
router.delete('/status-messages/:id', protect, deleteStatusMessage);

// Маршрут для получения файлов вложений
router.get('/attachments/:filename', protect, getAttachment);

export default router;