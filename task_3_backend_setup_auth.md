# Задача 3: Настройка Express.js сервера и реализация системы аутентификации

## Описание задачи
Необходимо настроить базовый Express.js сервер для сервиса управления ремонтом квартир и реализовать систему аутентификации и авторизации с поддержкой различных ролей пользователей.

## Требования

### 1. Настройка Express.js сервера

#### Базовая настройка сервера
- Создать основной файл приложения `app.js` в папке `backend/src/`
- Настроить Express.js сервер с поддержкой JSON и URL-encoded данных
- Настроить CORS для взаимодействия с фронтендом
- Настроить логирование запросов с помощью morgan
- Настроить обработку ошибок
- Настроить подключение к MongoDB с использованием Mongoose
- Настроить маршрутизацию API

#### Настройка middleware
- Реализовать middleware для обработки CORS
- Реализовать middleware для парсинга JSON и URL-encoded данных
- Реализовать middleware для логирования запросов
- Реализовать middleware для обработки ошибок
- Реализовать middleware для проверки аутентификации

#### Настройка конфигурации
- Создать папку `config` в `backend/src/`
- Создать файл `config.js` для хранения конфигурационных параметров
- Настроить загрузку переменных окружения из `.env` файла
- Настроить конфигурацию для разных окружений (development, production, test)

### 2. Реализация системы аутентификации

#### Модель пользователя
- Реализовать модель пользователя (User) с использованием Mongoose
- Добавить методы для хеширования и проверки паролей
- Добавить методы для генерации JWT токенов
- Добавить валидацию данных пользователя

#### API для регистрации пользователей
- Создать контроллер для регистрации пользователей
- Реализовать валидацию данных при регистрации
- Хеширование паролей с использованием bcrypt
- Сохранение пользователя в базе данных
- Отправка JWT токена после успешной регистрации

#### API для входа пользователей
- Создать контроллер для входа пользователей
- Реализовать валидацию данных при входе
- Проверка учетных данных пользователя
- Генерация JWT токена
- Отправка токена клиенту

#### Middleware для проверки токенов
- Создать middleware для проверки JWT токенов
- Реализовать извлечение данных пользователя из токена
- Добавление данных пользователя в объект запроса
- Обработка ошибок аутентификации

#### Управление ролями и правами доступа
- Создать middleware для проверки ролей пользователей
- Реализовать проверку прав доступа на основе ролей
- Настроить маршруты API с учетом ролей и прав доступа

## Технические детали

### Структура файлов и папок

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── models/
│   │   └── userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── roleMiddleware.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   └── jwtUtils.js
│   ├── config/
│   │   └── config.js
│   └── app.js
```

### Содержимое файлов

#### app.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { errorHandler } = require('./utils/errorHandler');
const config = require('./config/config');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Инициализация приложения
const app = express();

// Настройка middleware
app.use(helmet()); // Безопасность
app.use(cors()); // CORS
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных
app.use(morgan('dev')); // Логирование запросов

// Подключение к MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Настройка маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Обработка 404 ошибок
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

#### config/config.js
```javascript
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/brigada-renovation-service',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

#### models/userModel.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'not_brigadier', 'expert', 'coordinator', 'master', 'designer'],
    default: 'customer'
  },
  avatar: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Индексы
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Метод для генерации JWT токена
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
```

#### controllers/authController.js
```javascript
const User = require('../models/userModel');
const { errorHandler } = require('../utils/errorHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: role || 'customer' // Default role is customer
    });

    // Generate token
    const token = user.generateAuthToken();

    // Update last login
    user.last_login = Date.now();
    await user.save();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Update last login
    user.last_login = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};
```

#### controllers/userController.js
```javascript
const User = require('../models/userModel');
const { errorHandler } = require('../utils/errorHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, avatar } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

#### middlewares/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};
```

#### middlewares/roleMiddleware.js
```javascript
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};
```

#### middlewares/errorMiddleware.js
```javascript
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message);
    error.status = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.status = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.status = 400;
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

#### utils/errorHandler.js
```javascript
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message);
    error.status = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.status = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.status = 400;
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

#### utils/jwtUtils.js
```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};
```

#### routes/authRoutes.js
```javascript
const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
```

#### routes/userRoutes.js
```javascript
const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect); // Все маршруты требуют аутентификации

router.route('/')
  .get(authorize('not_brigadier'), getUsers);

router.route('/:id')
  .get(authorize('not_brigadier'), getUserById)
  .put(authorize('not_brigadier'), updateUser)
  .delete(authorize('not_brigadier'), deleteUser);

module.exports = router;
```

## Ожидаемый результат

1. Настроенный Express.js сервер с поддержкой всех необходимых middleware
2. Реализованная система аутентификации с поддержкой JWT токенов
3. Реализованная система авторизации с поддержкой различных ролей пользователей
4. API для регистрации и входа пользователей
5. API для управления пользователями (получение, обновление, удаление)

## Критерии приемки

1. Сервер успешно запускается и подключается к MongoDB
2. API для регистрации и входа пользователей работает корректно
3. Система аутентификации с JWT токенами работает корректно
4. Система авторизации с различными ролями работает корректно
5. API для управления пользователями работает корректно
6. Обработка ошибок реализована корректно
7. Код соответствует стандартам и лучшим практикам