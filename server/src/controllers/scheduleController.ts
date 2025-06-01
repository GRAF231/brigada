import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Schedule, ScheduleItem, ScheduleItemStatus, Project } from '../models';

/**
 * @desc    Получение графика работ проекта
 * @route   GET /api/projects/:id/schedule
 * @access  Private
 */
export const getProjectSchedule = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

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
      throw new Error('Нет доступа к графику работ этого проекта');
    }

    // Находим график работ проекта
    let schedule = await Schedule.findOne({ projectId });

    // Если графика работ нет, создаем новый
    if (!schedule) {
      schedule = await Schedule.create({ projectId });
    }

    // Получаем все работы графика
    const scheduleItems = await ScheduleItem.find({ scheduleId: schedule._id })
      .sort({ startDate: 1 });

    res.json({
      _id: schedule._id,
      projectId: schedule.projectId,
      items: scheduleItems,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении графика работ',
    });
  }
};

/**
 * @desc    Создание графика работ для проекта
 * @route   POST /api/projects/:id/schedule
 * @access  Private/Manager
 */
export const createProjectSchedule = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    // Проверяем, существует ли проект
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, существует ли уже график работ для этого проекта
    const existingSchedule = await Schedule.findOne({ projectId });
    if (existingSchedule) {
      res.status(400);
      throw new Error('График работ для этого проекта уже существует');
    }

    // Создаем новый график работ
    const schedule = await Schedule.create({ projectId });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при создании графика работ',
    });
  }
};

/**
 * @desc    Добавление работы в график
 * @route   POST /api/schedules/:id/items
 * @access  Private/Manager
 */
export const addScheduleItem = async (req: Request, res: Response) => {
  try {
    const scheduleId = req.params.id;
    const { name, startDate, endDate, status } = req.body;

    // Проверяем, существует ли график работ
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      res.status(404);
      throw new Error('График работ не найден');
    }

    // Проверяем, существует ли проект и имеет ли пользователь доступ к нему
    const project = await Project.findById(schedule.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к редактированию графика работ');
    }

    // Проверяем валидность дат
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400);
      throw new Error('Дата окончания должна быть позже даты начала');
    }

    // Проверяем валидность статуса
    if (status && !Object.values(ScheduleItemStatus).includes(status as ScheduleItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус работы');
    }

    // Создаем новую работу в графике
    const scheduleItem = await ScheduleItem.create({
      scheduleId,
      name,
      startDate: start,
      endDate: end,
      status: status || ScheduleItemStatus.NOT_STARTED
    });

    res.status(201).json(scheduleItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при добавлении работы в график',
    });
  }
};

/**
 * @desc    Обновление работы в графике
 * @route   PUT /api/schedule-items/:id
 * @access  Private/Manager
 */
export const updateScheduleItem = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, status } = req.body;

    const scheduleItem = await ScheduleItem.findById(req.params.id);
    if (!scheduleItem) {
      res.status(404);
      throw new Error('Работа не найдена');
    }

    // Получаем график работ и проект для проверки прав доступа
    const schedule = await Schedule.findById(scheduleItem.scheduleId);
    if (!schedule) {
      res.status(404);
      throw new Error('График работ не найден');
    }

    const project = await Project.findById(schedule.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к редактированию графика работ');
    }

    // Проверяем валидность дат
    let start = scheduleItem.startDate;
    let end = scheduleItem.endDate;

    if (startDate) {
      start = new Date(startDate);
    }

    if (endDate) {
      end = new Date(endDate);
    }

    if (end < start) {
      res.status(400);
      throw new Error('Дата окончания должна быть позже даты начала');
    }

    // Проверяем валидность статуса
    if (status && !Object.values(ScheduleItemStatus).includes(status as ScheduleItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус работы');
    }

    // Обновляем данные работы
    scheduleItem.name = name || scheduleItem.name;
    scheduleItem.startDate = start;
    scheduleItem.endDate = end;
    
    if (status) {
      scheduleItem.status = status as ScheduleItemStatus;
    }

    // Сохраняем обновленную работу
    const updatedScheduleItem = await scheduleItem.save();

    res.json(updatedScheduleItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при обновлении работы',
    });
  }
};

/**
 * @desc    Обновление статуса работы
 * @route   PATCH /api/schedule-items/:id/status
 * @access  Private
 */
export const updateScheduleItemStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(ScheduleItemStatus).includes(status as ScheduleItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус работы');
    }

    const scheduleItem = await ScheduleItem.findById(req.params.id);
    if (!scheduleItem) {
      res.status(404);
      throw new Error('Работа не найдена');
    }

    // Получаем график работ и проект для проверки прав доступа
    const schedule = await Schedule.findById(scheduleItem.scheduleId);
    if (!schedule) {
      res.status(404);
      throw new Error('График работ не найден');
    }

    const project = await Project.findById(schedule.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем права доступа в зависимости от роли пользователя
    if (req.user.role !== 'manager' && req.user.role !== 'master') {
      res.status(403);
      throw new Error('Нет доступа к изменению статуса работы');
    }

    // Обновляем статус работы
    scheduleItem.status = status as ScheduleItemStatus;

    // Сохраняем обновленную работу
    const updatedScheduleItem = await scheduleItem.save();

    res.json(updatedScheduleItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при обновлении статуса работы',
    });
  }
};

/**
 * @desc    Удаление работы из графика
 * @route   DELETE /api/schedule-items/:id
 * @access  Private/Manager
 */
export const deleteScheduleItem = async (req: Request, res: Response) => {
  try {
    const scheduleItem = await ScheduleItem.findById(req.params.id);
    if (!scheduleItem) {
      res.status(404);
      throw new Error('Работа не найдена');
    }

    // Получаем график работ и проект для проверки прав доступа
    const schedule = await Schedule.findById(scheduleItem.scheduleId);
    if (!schedule) {
      res.status(404);
      throw new Error('График работ не найден');
    }

    const project = await Project.findById(schedule.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к удалению работы из графика');
    }

    // Удаляем работу из графика
    await scheduleItem.deleteOne();

    res.json({ message: 'Работа удалена из графика' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при удалении работы из графика',
    });
  }
};