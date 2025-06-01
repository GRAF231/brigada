import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StatusMessage, Project } from '../models';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Получение истории статусов проекта
 * @route   GET /api/projects/:id/status
 * @access  Private
 */
export const getProjectStatusMessages = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const { limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Проверяем, существует ли проект
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    if (req.user.role !== 'manager' && 
        project.clientId.toString() !== req.user._id.toString()) {
      // Проверка на участие в проекте будет добавлена позже
      res.status(403);
      throw new Error('Нет доступа к статусам этого проекта');
    }

    // Получаем сообщения о статусе с пагинацией
    const statusMessages = await StatusMessage.find({ projectId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    // Получаем общее количество сообщений для пагинации
    const total = await StatusMessage.countDocuments({ projectId });

    res.json({
      statusMessages,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении статусов проекта',
    });
  }
};

/**
 * @desc    Создание сообщения о статусе
 * @route   POST /api/projects/:id/status
 * @access  Private
 */
export const createStatusMessage = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const { message } = req.body;

    // Проверяем, существует ли проект
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    if (req.user.role !== 'manager' && 
        project.clientId.toString() !== req.user._id.toString()) {
      // Проверка на участие в проекте будет добавлена позже
      res.status(403);
      throw new Error('Нет доступа к добавлению статусов для этого проекта');
    }

    // Проверяем наличие сообщения
    if (!message) {
      res.status(400);
      throw new Error('Пожалуйста, введите сообщение');
    }

    // Создаем новое сообщение о статусе
    const statusMessage = await StatusMessage.create({
      projectId,
      userId: req.user._id,
      message,
      attachments: []
    });

    // Получаем созданное сообщение с информацией о пользователе
    const createdStatusMessage = await StatusMessage.findById(statusMessage._id)
      .populate('userId', 'name email role');

    res.status(201).json(createdStatusMessage);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при создании сообщения о статусе',
    });
  }
};

/**
 * @desc    Загрузка файлов для сообщения о статусе
 * @route   POST /api/status-messages/:id/attachments
 * @access  Private
 */
export const uploadAttachments = async (req: Request, res: Response) => {
  try {
    const statusMessageId = req.params.id;

    // Проверяем, существует ли сообщение о статусе
    const statusMessage = await StatusMessage.findById(statusMessageId);
    if (!statusMessage) {
      res.status(404);
      throw new Error('Сообщение о статусе не найдено');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    const project = await Project.findById(statusMessage.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager' && 
        statusMessage.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Нет доступа к добавлению файлов для этого сообщения');
    }

    // Проверяем наличие файлов
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400);
      throw new Error('Пожалуйста, загрузите файлы');
    }

    // Добавляем информацию о файлах в сообщение
    const files = req.files as Express.Multer.File[];
    const attachments = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    }));

    statusMessage.attachments = [...statusMessage.attachments, ...attachments];

    // Сохраняем обновленное сообщение
    const updatedStatusMessage = await statusMessage.save();

    // Получаем обновленное сообщение с информацией о пользователе
    const populatedStatusMessage = await StatusMessage.findById(updatedStatusMessage._id)
      .populate('userId', 'name email role');

    res.json(populatedStatusMessage);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при загрузке файлов',
    });
  }
};

/**
 * @desc    Удаление сообщения о статусе
 * @route   DELETE /api/status-messages/:id
 * @access  Private
 */
export const deleteStatusMessage = async (req: Request, res: Response) => {
  try {
    const statusMessage = await StatusMessage.findById(req.params.id);
    if (!statusMessage) {
      res.status(404);
      throw new Error('Сообщение о статусе не найдено');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    const project = await Project.findById(statusMessage.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager' && 
        statusMessage.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Нет доступа к удалению этого сообщения');
    }

    // Удаляем файлы, связанные с сообщением
    for (const attachment of statusMessage.attachments) {
      const filePath = attachment.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Удаляем сообщение
    await statusMessage.deleteOne();

    res.json({ message: 'Сообщение о статусе удалено' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при удалении сообщения о статусе',
    });
  }
};

/**
 * @desc    Получение файла вложения
 * @route   GET /api/attachments/:filename
 * @access  Private
 */
export const getAttachment = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, filename);

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error('Файл не найден');
    }

    // Отправляем файл
    res.sendFile(filePath);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении файла',
    });
  }
};