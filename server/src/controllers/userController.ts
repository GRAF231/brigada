import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, UserRole } from '../models';
import generateToken from '../utils/generateToken';

/**
 * @desc    Аутентификация пользователя и получение токена
 * @route   POST /api/users/login
 * @access  Public
 */
export const authUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error('Неверный email или пароль');
    }

    // Проверяем пароль
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Неверный email или пароль');
    }

    // Если все проверки пройдены, отправляем данные пользователя и токен
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken((user._id as mongoose.Types.ObjectId).toString()),
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка',
    });
  }
};

/**
 * @desc    Регистрация нового пользователя
 * @route   POST /api/users
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Пользователь с таким email уже существует');
    }

    // Проверяем валидность роли
    if (!Object.values(UserRole).includes(role as UserRole)) {
      res.status(400);
      throw new Error('Недопустимая роль пользователя');
    }

    // Создаем нового пользователя
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      // Если пользователь успешно создан, отправляем данные и токен
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken((user._id as mongoose.Types.ObjectId).toString()),
      });
    } else {
      res.status(400);
      throw new Error('Некорректные данные пользователя');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка',
    });
  }
};

/**
 * @desc    Получение профиля пользователя
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('Пользователь не найден');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка',
    });
  }
};

/**
 * @desc    Обновление профиля пользователя
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('Пользователь не найден');
    }

    // Обновляем данные пользователя
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Если в запросе есть пароль, обновляем его
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Сохраняем обновленного пользователя
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken((updatedUser._id as mongoose.Types.ObjectId).toString()),
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка',
    });
  }
};

/**
 * @desc    Поиск пользователей по роли
 * @route   GET /api/users/search
 * @access  Private
 */
export const searchUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    // Проверяем, указана ли роль
    if (!role) {
      res.status(400).json({ message: 'Необходимо указать роль для поиска' });
      return;
    }
    
    // Проверяем валидность роли
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      res.status(400).json({ message: 'Недопустимая роль пользователя' });
      return;
    }
    
    // Ищем пользователей по роли
    const users = await User.find({ role }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка при поиске пользователей',
    });
  }
};

/**
 * @desc    Получение всех пользователей
 * @route   GET /api/users
 * @access  Private/Manager
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500);
    res.json({
      message: error instanceof Error ? error.message : 'Произошла ошибка',
    });
  }
};