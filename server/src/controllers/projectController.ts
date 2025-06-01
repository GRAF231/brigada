import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project, ProjectStatus, User, ProjectUser } from '../models';

/**
 * @desc    Получение списка проектов
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Создаем фильтр для запроса
    const filter: any = {};

    // Если пользователь не менеджер, показываем только проекты, в которых он участвует
    if (req.user.role !== 'manager') {
      // Находим все проекты, где пользователь является участником
      const projectUsers = await ProjectUser.find({ userId: req.user._id });
      const projectIds = projectUsers.map(pu => pu.projectId);

      // Добавляем к фильтру проекты, где пользователь является клиентом
      filter.$or = [
        { clientId: req.user._id },
        { _id: { $in: projectIds } }
      ];
    }

    // Если указан статус, добавляем его в фильтр
    if (status && Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      filter.status = status;
    }

    // Получаем проекты с пагинацией
    const projects = await Project.find(filter)
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Получаем общее количество проектов для пагинации
    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении проектов',
    });
  }
};

/**
 * @desc    Получение проекта по ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    if (req.user.role !== 'manager' && 
        project.clientId.toString() !== req.user._id.toString()) {
      // Проверяем, является ли пользователь участником проекта
      const projectUser = await ProjectUser.findOne({
        projectId: project._id,
        userId: req.user._id
      });

      if (!projectUser) {
        res.status(403);
        throw new Error('Нет доступа к этому проекту');
      }
    }

    res.json(project);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении проекта',
    });
  }
};

/**
 * @desc    Создание нового проекта
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, address, startDate, endDate, clientId, managerId, status } = req.body;

    // Проверяем, существует ли клиент
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      res.status(400);
      throw new Error('Указанный клиент не найден или не является заказчиком');
    }

    // Проверяем, существует ли менеджер
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      res.status(400);
      throw new Error('Указанный менеджер не найден или не является НеБригадиром');
    }

    // Проверяем валидность статуса
    if (status && !Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус проекта');
    }

    // Создаем новый проект
    const project = await Project.create({
      name,
      address,
      startDate,
      endDate,
      clientId,
      managerId,
      status: status || ProjectStatus.PLANNING
    });

    if (project) {
      res.status(201).json(project);
    } else {
      res.status(400);
      throw new Error('Некорректные данные проекта');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при создании проекта',
    });
  }
};

/**
 * @desc    Обновление проекта
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { name, address, startDate, endDate, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    if (req.user.role !== 'manager' && 
        project.clientId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Нет доступа к редактированию этого проекта');
    }

    // Проверяем валидность статуса
    if (status && !Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      res.status(400);
      throw new Error('Недопустимый статус проекта');
    }

    // Обновляем данные проекта
    project.name = name || project.name;
    project.address = address || project.address;
    project.startDate = startDate ? new Date(startDate) : project.startDate;
    project.endDate = endDate ? new Date(endDate) : project.endDate;
    project.status = status as ProjectStatus || project.status;

    // Сохраняем обновленный проект
    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при обновлении проекта',
    });
  }
};

/**
 * @desc    Удаление проекта
 * @route   DELETE /api/projects/:id
 * @access  Private/Manager
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Удаляем проект
    await project.deleteOne();

    res.json({ message: 'Проект удален' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при удалении проекта',
    });
  }
};

/**
 * @desc    Получение участников проекта
 * @route   GET /api/projects/:id/users
 * @access  Private
 */
export const getProjectUsers = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, имеет ли пользователь доступ к проекту
    if (req.user.role !== 'manager' && 
        project.clientId.toString() !== req.user._id.toString()) {
      // Проверяем, является ли пользователь участником проекта
      const projectUser = await ProjectUser.findOne({
        projectId: project._id,
        userId: req.user._id
      });

      if (!projectUser) {
        res.status(403);
        throw new Error('Нет доступа к этому проекту');
      }
    }

    // Получаем всех участников проекта
    const projectUsers = await ProjectUser.find({ projectId: project._id });
    
    // Получаем информацию о пользователях
    const userIds = projectUsers.map(pu => pu.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('-password');

    // Добавляем клиента и менеджера проекта, если они еще не в списке
    const clientUser = await User.findById(project.clientId).select('-password');
    const managerUser = await User.findById(project.managerId).select('-password');

    const allUsers = [...users];
    
    // Проверяем, есть ли клиент в списке пользователей
    if (clientUser) {
      const clientId = project.clientId.toString();
      if (!userIds.some(id => id.toString() === clientId)) {
        allUsers.push(clientUser);
      }
    }
    
    // Проверяем, есть ли менеджер в списке пользователей
    if (managerUser) {
      const managerId = project.managerId.toString();
      if (!userIds.some(id => id.toString() === managerId)) {
        allUsers.push(managerUser);
      }
    }

    res.json(allUsers);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при получении участников проекта',
    });
  }
};

/**
 * @desc    Добавление пользователя в проект
 * @route   POST /api/projects/:id/users
 * @access  Private/Manager
 */
export const addProjectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Проект не найден');
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      res.status(400);
      throw new Error('Пользователь не найден');
    }

    // Проверяем, не является ли пользователь уже участником проекта
    const existingProjectUser = await ProjectUser.findOne({
      projectId: project._id,
      userId: user._id
    });

    if (existingProjectUser) {
      res.status(400);
      throw new Error('Пользователь уже является участником проекта');
    }

    // Добавляем пользователя в проект
    const projectUser = await ProjectUser.create({
      projectId: project._id,
      userId: user._id
    });

    if (projectUser) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400);
      throw new Error('Не удалось добавить пользователя в проект');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при добавлении пользователя в проект',
    });
  }
};