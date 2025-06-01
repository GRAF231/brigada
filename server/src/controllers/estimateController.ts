import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Estimate, EstimateItem, EstimateItemStatus, Project } from '../models';

/**
 * @desc    Получение сметы проекта
 * @route   GET /api/projects/:id/estimate
 * @access  Private
 */
export const getProjectEstimate = async (req: Request, res: Response) => {
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
      throw new Error('Нет доступа к смете этого проекта');
    }

    // Находим смету проекта
    let estimate = await Estimate.findOne({ projectId });

    // Если сметы нет, создаем новую
    if (!estimate) {
      estimate = await Estimate.create({ projectId });
    }

    // Получаем все позиции сметы
    const estimateItems = await EstimateItem.find({ estimateId: estimate._id });

    // Формируем иерархическую структуру позиций сметы
    interface EstimateItemWithChildren extends mongoose.Document {
      _id: mongoose.Types.ObjectId;
      estimateId: mongoose.Types.ObjectId;
      parentId?: mongoose.Types.ObjectId;
      name: string;
      unit: string;
      quantity: number;
      price: number;
      amount: number;
      status: string;
      children: EstimateItemWithChildren[];
      toObject(): any;
    }

    const itemsMap = new Map<string, EstimateItemWithChildren>();
    const rootItems: EstimateItemWithChildren[] = [];

    // Сначала добавляем все позиции в Map для быстрого доступа
    estimateItems.forEach(item => {
      const itemId = (item._id as mongoose.Types.ObjectId).toString();
      itemsMap.set(itemId, {
        ...item.toObject(),
        children: []
      } as unknown as EstimateItemWithChildren);
    });

    // Затем строим иерархию
    estimateItems.forEach(item => {
      const itemId = (item._id as mongoose.Types.ObjectId).toString();
      const itemWithChildren = itemsMap.get(itemId);
      
      if (itemWithChildren) {
        if (item.parentId) {
          // Если у позиции есть родитель, добавляем ее в children родителя
          const parentId = (item.parentId as mongoose.Types.ObjectId).toString();
          const parentItem = itemsMap.get(parentId);
          if (parentItem) {
            parentItem.children.push(itemWithChildren);
          } else {
            // Если родитель не найден, добавляем как корневую позицию
            rootItems.push(itemWithChildren);
          }
        } else {
          // Если у позиции нет родителя, это корневая позиция
          rootItems.push(itemWithChildren);
        }
      }
    });

    res.json({
      _id: estimate._id,
      projectId: estimate.projectId,
      items: rootItems,
      createdAt: estimate.createdAt,
      updatedAt: estimate.updatedAt
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении сметы',
    });
  }
};

/**
 * @desc    Создание сметы для проекта
 * @route   POST /api/projects/:id/estimate
 * @access  Private/Manager
 */
export const createProjectEstimate = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    // Проверяем, существует ли проект
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, существует ли уже смета для этого проекта
    const existingEstimate = await Estimate.findOne({ projectId });
    if (existingEstimate) {
      res.status(400);
      throw new Error('Смета для этого проекта уже существует');
    }

    // Создаем новую смету
    const estimate = await Estimate.create({ projectId });

    res.status(201).json(estimate);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при создании сметы',
    });
  }
};

/**
 * @desc    Добавление позиции в смету
 * @route   POST /api/estimates/:id/items
 * @access  Private/Manager
 */
export const addEstimateItem = async (req: Request, res: Response) => {
  try {
    const estimateId = req.params.id;
    const { name, unit, quantity, price, parentId, status } = req.body;

    // Проверяем, существует ли смета
    const estimate = await Estimate.findById(estimateId);
    if (!estimate) {
      res.status(404);
      throw new Error('Смета не найдена');
    }

    // Проверяем, существует ли проект и имеет ли пользователь доступ к нему
    const project = await Project.findById(estimate.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к редактированию сметы');
    }

    // Проверяем, существует ли родительская позиция, если указана
    if (parentId) {
      const parentItem = await EstimateItem.findById(parentId);
      if (!parentItem || parentItem.estimateId.toString() !== estimateId) {
        res.status(400);
        throw new Error('Родительская позиция не найдена или не принадлежит этой смете');
      }
    }

    // Проверяем валидность статуса
    if (status && !Object.values(EstimateItemStatus).includes(status as EstimateItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус позиции');
    }

    // Рассчитываем сумму
    const amount = Number(quantity) * Number(price);

    // Создаем новую позицию сметы
    const estimateItem = await EstimateItem.create({
      estimateId,
      parentId: parentId || null,
      name,
      unit,
      quantity,
      price,
      amount,
      status: status || EstimateItemStatus.NOT_STARTED
    });

    res.status(201).json(estimateItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при добавлении позиции в смету',
    });
  }
};

/**
 * @desc    Обновление позиции сметы
 * @route   PUT /api/estimate-items/:id
 * @access  Private/Manager
 */
export const updateEstimateItem = async (req: Request, res: Response) => {
  try {
    const { name, unit, quantity, price, status } = req.body;

    const estimateItem = await EstimateItem.findById(req.params.id);
    if (!estimateItem) {
      res.status(404);
      throw new Error('Позиция сметы не найдена');
    }

    // Получаем смету и проект для проверки прав доступа
    const estimate = await Estimate.findById(estimateItem.estimateId);
    if (!estimate) {
      res.status(404);
      throw new Error('Смета не найдена');
    }

    const project = await Project.findById(estimate.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к редактированию сметы');
    }

    // Проверяем валидность статуса
    if (status && !Object.values(EstimateItemStatus).includes(status as EstimateItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус позиции');
    }

    // Обновляем данные позиции сметы
    estimateItem.name = name || estimateItem.name;
    estimateItem.unit = unit || estimateItem.unit;
    
    if (quantity !== undefined) {
      estimateItem.quantity = quantity;
    }
    
    if (price !== undefined) {
      estimateItem.price = price;
    }
    
    // Пересчитываем сумму, если изменились количество или цена
    if (quantity !== undefined || price !== undefined) {
      estimateItem.amount = estimateItem.quantity * estimateItem.price;
    }
    
    if (status) {
      estimateItem.status = status as EstimateItemStatus;
    }

    // Сохраняем обновленную позицию сметы
    const updatedEstimateItem = await estimateItem.save();

    res.json(updatedEstimateItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при обновлении позиции сметы',
    });
  }
};

/**
 * @desc    Обновление статуса позиции сметы
 * @route   PATCH /api/estimate-items/:id/status
 * @access  Private
 */
export const updateEstimateItemStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(EstimateItemStatus).includes(status as EstimateItemStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус позиции');
    }

    const estimateItem = await EstimateItem.findById(req.params.id);
    if (!estimateItem) {
      res.status(404);
      throw new Error('Позиция сметы не найдена');
    }

    // Получаем смету и проект для проверки прав доступа
    const estimate = await Estimate.findById(estimateItem.estimateId);
    if (!estimate) {
      res.status(404);
      throw new Error('Смета не найдена');
    }

    const project = await Project.findById(estimate.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем права доступа в зависимости от роли пользователя и статуса
    if (req.user.role !== 'manager' && req.user.role !== 'client') {
      res.status(403);
      throw new Error('Нет доступа к изменению статуса позиции сметы');
    }

    // Клиент может изменять статус только на "Профинансировано"
    if (req.user.role === 'client' && status !== EstimateItemStatus.FINANCED) {
      res.status(403);
      throw new Error('Заказчик может изменять статус только на "Профинансировано"');
    }

    // Обновляем статус позиции сметы
    estimateItem.status = status as EstimateItemStatus;

    // Сохраняем обновленную позицию сметы
    const updatedEstimateItem = await estimateItem.save();

    res.json(updatedEstimateItem);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при обновлении статуса позиции сметы',
    });
  }
};

/**
 * @desc    Удаление позиции сметы
 * @route   DELETE /api/estimate-items/:id
 * @access  Private/Manager
 */
export const deleteEstimateItem = async (req: Request, res: Response) => {
  try {
    const estimateItem = await EstimateItem.findById(req.params.id);
    if (!estimateItem) {
      res.status(404);
      throw new Error('Позиция сметы не найдена');
    }

    // Получаем смету и проект для проверки прав доступа
    const estimate = await Estimate.findById(estimateItem.estimateId);
    if (!estimate) {
      res.status(404);
      throw new Error('Смета не найдена');
    }

    const project = await Project.findById(estimate.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    if (req.user.role !== 'manager') {
      res.status(403);
      throw new Error('Нет доступа к удалению позиции сметы');
    }

    // Находим все дочерние позиции
    const childItems = await EstimateItem.find({ parentId: estimateItem._id });

    // Удаляем все дочерние позиции
    for (const childItem of childItems) {
      await childItem.deleteOne();
    }

    // Удаляем позицию сметы
    await estimateItem.deleteOne();

    res.json({ message: 'Позиция сметы удалена' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при удалении позиции сметы',
    });
  }
};