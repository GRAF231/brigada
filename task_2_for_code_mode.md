# Задача 2 для режима Code: Реализация моделей данных MongoDB

## Описание задачи

После проектирования схемы базы данных необходимо реализовать модели данных Mongoose для всех сущностей системы управления ремонтом квартир. Модели должны включать валидацию данных, настройку индексов и методы для работы с данными.

## Инструкции

1. Создайте следующие модели Mongoose в папке `backend/src/models/`:

   - `userModel.js` - модель пользователя
   - `projectModel.js` - модель проекта
   - `projectUserModel.js` - модель связи между проектом и пользователем
   - `estimateItemModel.js` - модель пункта сметы
   - `scheduleItemModel.js` - модель задачи в графике работ
   - `statusMessageModel.js` - модель сообщения о статусе
   - `messageAttachmentModel.js` - модель вложения к сообщению
   - `messageCommentModel.js` - модель комментария к сообщению
   - `priceListModel.js` - модель прайс-листа
   - `priceListItemModel.js` - модель позиции прайс-листа
   - `pdfDocumentModel.js` - модель PDF документа дизайн-проекта

2. Для каждой модели реализуйте:
   - Схему Mongoose с определением всех полей, их типов и ограничений
   - Валидацию данных с использованием встроенных и кастомных валидаторов
   - Настройку индексов для оптимизации запросов
   - Методы для работы с данными (при необходимости)
   - Middleware для обработки данных перед сохранением или после получения

3. Создайте файл `index.js` в папке `models` для экспорта всех моделей.

## Детальное описание моделей

### 1. userModel.js

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

### 2. projectModel.js

```javascript
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed'],
    default: 'planning'
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Индексы
projectSchema.index({ created_by: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ start_date: 1 });
projectSchema.index({ end_date: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
```

Для остальных моделей следуйте аналогичной структуре, используя схему базы данных из файла [task_2_database_schema_design.md](task_2_database_schema_design.md).

## Файл index.js для экспорта всех моделей

```javascript
const User = require('./userModel');
const Project = require('./projectModel');
const ProjectUser = require('./projectUserModel');
const EstimateItem = require('./estimateItemModel');
const ScheduleItem = require('./scheduleItemModel');
const StatusMessage = require('./statusMessageModel');
const MessageAttachment = require('./messageAttachmentModel');
const MessageComment = require('./messageCommentModel');
const PriceList = require('./priceListModel');
const PriceListItem = require('./priceListItemModel');
const PdfDocument = require('./pdfDocumentModel');

module.exports = {
  User,
  Project,
  ProjectUser,
  EstimateItem,
  ScheduleItem,
  StatusMessage,
  MessageAttachment,
  MessageComment,
  PriceList,
  PriceListItem,
  PdfDocument
};
```

## Полное описание схемы базы данных

Полное детальное описание схемы базы данных и всех моделей находится в файле [task_2_database_schema_design.md](task_2_database_schema_design.md). Там вы найдете:

- Подробное описание всех коллекций и их полей
- Описание связей между коллекциями
- Описание индексов для оптимизации запросов
- Примеры документов для каждой коллекции

## Ожидаемый результат

1. Реализованы все модели Mongoose для всех сущностей системы
2. Настроена валидация данных для всех моделей
3. Настроены индексы для оптимизации запросов
4. Реализованы методы для работы с данными
5. Создан файл index.js для экспорта всех моделей

## Переход к следующей задаче

После выполнения этой задачи мы перейдем к Задаче 3: Настройка Express.js сервера и реализация системы аутентификации.