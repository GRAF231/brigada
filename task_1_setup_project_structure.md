# Задача 1: Настройка базовой структуры проекта

## Описание задачи
Необходимо создать базовую структуру проекта для сервиса управления ремонтом квартир. Проект должен быть организован как PWA (Progressive Web Application) на стеке React + Node.js + MongoDB.

## Требования

### Общая структура проекта
Создать репозиторий с названием "brigada-renovation-service" со следующей структурой:

```
brigada-renovation-service/
├── backend/         # Серверная часть на Node.js/Express
├── frontend/        # Клиентская часть на React
├── .gitignore       # Общий .gitignore для всего проекта
└── README.md        # Общее описание проекта
```

### Структура бэкенда (backend/)
```
backend/
├── src/
│   ├── controllers/     # Контроллеры для обработки запросов
│   ├── models/          # Mongoose модели для работы с MongoDB
│   ├── routes/          # Маршруты API
│   ├── middlewares/     # Middleware функции
│   ├── services/        # Бизнес-логика и сервисы
│   ├── utils/           # Вспомогательные функции и утилиты
│   ├── config/          # Конфигурационные файлы
│   └── app.js           # Основной файл приложения
├── .env.example         # Пример файла с переменными окружения
├── .gitignore           # Файлы, которые не должны попадать в репозиторий
├── package.json         # Зависимости и скрипты для бэкенда
└── README.md            # Описание бэкенда и инструкции по запуску
```

### Структура фронтенда (frontend/)
```
frontend/
├── public/              # Статические файлы
│   ├── index.html       # Основной HTML файл
│   ├── manifest.json    # Манифест PWA
│   ├── robots.txt       # Файл для поисковых роботов
│   └── favicon.ico      # Иконка сайта
├── src/
│   ├── assets/          # Статические ресурсы (изображения, шрифты и т.д.)
│   ├── components/      # Переиспользуемые компоненты
│   │   ├── common/      # Общие компоненты (кнопки, формы и т.д.)
│   │   ├── layout/      # Компоненты макета (хедер, футер и т.д.)
│   │   ├── auth/        # Компоненты аутентификации
│   │   ├── projects/    # Компоненты для работы с проектами
│   │   ├── estimates/   # Компоненты для работы со сметами
│   │   ├── schedule/    # Компоненты для работы с графиком работ
│   │   └── status/      # Компоненты для работы со статусами
│   ├── contexts/        # React контексты
│   ├── hooks/           # Пользовательские хуки
│   ├── pages/           # Компоненты страниц
│   ├── services/        # Сервисы для работы с API
│   ├── utils/           # Вспомогательные функции и утилиты
│   ├── App.js           # Основной компонент приложения
│   ├── index.js         # Точка входа в приложение
│   └── serviceWorker.js # Сервис-воркер для PWA
├── .env.example         # Пример файла с переменными окружения
├── .gitignore           # Файлы, которые не должны попадать в репозиторий
├── package.json         # Зависимости и скрипты для фронтенда
└── README.md            # Описание фронтенда и инструкции по запуску
```

## Настройка конфигурационных файлов

### Общий .gitignore
Создать файл `.gitignore` в корне проекта со следующим содержимым:

```
# Зависимости
node_modules/
.pnp/
.pnp.js

# Тестирование
coverage/

# Сборка
build/
dist/
out/

# Переменные окружения
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Логи
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Редакторы
.idea/
.vscode/
*.swp
*.swo

# ОС
.DS_Store
Thumbs.db
```

### package.json для бэкенда
Создать файл `package.json` в папке `backend/` со следующим содержимым:

```json
{
  "name": "brigada-renovation-service-backend",
  "version": "1.0.0",
  "description": "Backend for Brigada Renovation Service",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "helmet": "^6.0.1",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pdf.js": "^0.1.0",
    "validator": "^13.9.0"
  },
  "devDependencies": {
    "eslint": "^8.36.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-prettier": "^4.2.1",
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "prettier": "^2.8.7",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### package.json для фронтенда
Создать файл `package.json` в папке `frontend/` со следующим содержимым:

```json
{
  "name": "brigada-renovation-service-frontend",
  "version": "1.0.0",
  "description": "Frontend for Brigada Renovation Service",
  "private": true,
  "dependencies": {
    "@material-ui/core": "^4.12.4",
    "@material-ui/icons": "^4.11.3",
    "axios": "^1.3.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-pdf": "^6.2.2",
    "react-router-dom": "^6.10.0",
    "react-scripts": "5.0.1",
    "redux": "^4.2.1",
    "react-redux": "^8.0.5",
    "redux-thunk": "^2.4.2",
    "workbox-background-sync": "^6.5.4",
    "workbox-core": "^6.5.4",
    "workbox-expiration": "^6.5.4",
    "workbox-precaching": "^6.5.4",
    "workbox-routing": "^6.5.4",
    "workbox-strategies": "^6.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "eslint": "^8.36.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-react": "^7.32.2",
    "prettier": "^2.8.7"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### .env.example для бэкенда
Создать файл `.env.example` в папке `backend/` со следующим содержимым:

```
# Порт сервера
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/brigada-renovation-service

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Окружение
NODE_ENV=development
```

### .env.example для фронтенда
Создать файл `.env.example` в папке `frontend/` со следующим содержимым:

```
# API URL
REACT_APP_API_URL=http://localhost:5000/api

# Окружение
NODE_ENV=development
```

### README.md для корня проекта
Создать файл `README.md` в корне проекта со следующим содержимым:

```markdown
# Brigada Renovation Service

Сервис для управления ремонтом квартир, позволяющий отслеживать статус ремонта и баланс взаиморасчётов между заказчиком, компанией и мастерами.

## Основные функциональные блоки

1. **Взаиморасчеты и смета** - иерархический список работ с возможностью развернуть пункты и увидеть подпункты, статусы выполнения и финансирования.
2. **График работ** - интерактивный график Ганта для отслеживания прогресса работ.
3. **Текущий статус и история статусов** - обновляемый список сообщений от сотрудников сервиса.

## Технологии

- **Фронтенд**: React, PWA
- **Бэкенд**: Node.js, Express
- **База данных**: MongoDB

## Структура проекта

- `backend/` - серверная часть приложения
- `frontend/` - клиентская часть приложения

## Установка и запуск

### Требования

- Node.js (версия 14.x или выше)
- MongoDB (версия 4.x или выше)

### Установка

1. Клонировать репозиторий:
   ```
   git clone https://github.com/yourusername/brigada-renovation-service.git
   cd brigada-renovation-service
   ```

2. Установить зависимости для бэкенда:
   ```
   cd backend
   npm install
   ```

3. Установить зависимости для фронтенда:
   ```
   cd ../frontend
   npm install
   ```

4. Создать файлы `.env` на основе `.env.example` в папках `backend/` и `frontend/`.

### Запуск

1. Запустить бэкенд:
   ```
   cd backend
   npm run dev
   ```

2. Запустить фронтенд:
   ```
   cd ../frontend
   npm start
   ```

3. Открыть приложение в браузере: http://localhost:3000

## Лицензия

MIT
```

### README.md для бэкенда
Создать файл `README.md` в папке `backend/` со следующим содержимым:

```markdown
# Brigada Renovation Service - Backend

Серверная часть сервиса для управления ремонтом квартир.

## Технологии

- Node.js
- Express
- MongoDB
- Mongoose
- JWT для аутентификации

## Структура проекта

- `src/controllers/` - контроллеры для обработки запросов
- `src/models/` - Mongoose модели для работы с MongoDB
- `src/routes/` - маршруты API
- `src/middlewares/` - middleware функции
- `src/services/` - бизнес-логика и сервисы
- `src/utils/` - вспомогательные функции и утилиты
- `src/config/` - конфигурационные файлы
- `src/app.js` - основной файл приложения

## Установка и запуск

### Требования

- Node.js (версия 14.x или выше)
- MongoDB (версия 4.x или выше)

### Установка

1. Установить зависимости:
   ```
   npm install
   ```

2. Создать файл `.env` на основе `.env.example`.

### Запуск

1. Запустить в режиме разработки:
   ```
   npm run dev
   ```

2. Запустить в продакшн режиме:
   ```
   npm start
   ```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация нового пользователя
- `POST /api/auth/login` - вход пользователя

### Пользователи
- `GET /api/users` - получение списка пользователей
- `GET /api/users/:id` - получение информации о пользователе
- `PUT /api/users/:id` - обновление информации о пользователе
- `DELETE /api/users/:id` - удаление пользователя

### Проекты
- `GET /api/projects` - получение списка проектов
- `POST /api/projects` - создание нового проекта
- `GET /api/projects/:id` - получение информации о проекте
- `PUT /api/projects/:id` - обновление информации о проекте
- `DELETE /api/projects/:id` - удаление проекта

### Сметы
- `GET /api/projects/:id/estimates` - получение сметы проекта
- `POST /api/projects/:id/estimates` - добавление пункта сметы
- `PUT /api/projects/:id/estimates/:itemId` - обновление пункта сметы
- `DELETE /api/projects/:id/estimates/:itemId` - удаление пункта сметы

### График работ
- `GET /api/projects/:id/schedule` - получение графика работ проекта
- `POST /api/projects/:id/schedule` - добавление задачи в график
- `PUT /api/projects/:id/schedule/:itemId` - обновление задачи
- `DELETE /api/projects/:id/schedule/:itemId` - удаление задачи

### Статусы и сообщения
- `GET /api/projects/:id/status` - получение статусов проекта
- `POST /api/projects/:id/status` - добавление сообщения о статусе
- `PUT /api/projects/:id/status/:messageId` - обновление сообщения
- `DELETE /api/projects/:id/status/:messageId` - удаление сообщения

## Тестирование

```
npm test
```

## Линтинг

```
npm run lint
```

Исправление ошибок линтинга:

```
npm run lint:fix
```
```

### README.md для фронтенда
Создать файл `README.md` в папке `frontend/` со следующим содержимым:

```markdown
# Brigada Renovation Service - Frontend

Клиентская часть сервиса для управления ремонтом квартир.

## Технологии

- React
- React Router
- Redux
- Material-UI
- PWA (Progressive Web Application)

## Структура проекта

- `public/` - статические файлы
- `src/assets/` - статические ресурсы (изображения, шрифты и т.д.)
- `src/components/` - переиспользуемые компоненты
- `src/contexts/` - React контексты
- `src/hooks/` - пользовательские хуки
- `src/pages/` - компоненты страниц
- `src/services/` - сервисы для работы с API
- `src/utils/` - вспомогательные функции и утилиты
- `src/App.js` - основной компонент приложения
- `src/index.js` - точка входа в приложение
- `src/serviceWorker.js` - сервис-воркер для PWA

## Установка и запуск

### Требования

- Node.js (версия 14.x или выше)

### Установка

1. Установить зависимости:
   ```
   npm install
   ```

2. Создать файл `.env` на основе `.env.example`.

### Запуск

1. Запустить в режиме разработки:
   ```
   npm start
   ```

2. Собрать для продакшн:
   ```
   npm run build
   ```

## Основные страницы

- `/` - главная страница
- `/login` - страница входа
- `/register` - страница регистрации
- `/projects` - список проектов
- `/projects/:id` - детальная информация о проекте
- `/projects/:id/estimates` - смета проекта
- `/projects/:id/schedule` - график работ проекта
- `/projects/:id/status` - статусы и сообщения проекта

## PWA функциональность

Приложение поддерживает функциональность PWA, включая:
- Установку на домашний экран
- Оффлайн-режим
- Push-уведомления

## Тестирование

```
npm test
```

## Линтинг

```
npm run lint
```

Исправление ошибок линтинга:

```
npm run lint:fix
```
```

## Ожидаемый результат

1. Создана базовая структура проекта с папками для бэкенда и фронтенда
2. Настроены все необходимые конфигурационные файлы
3. Созданы README.md файлы с описанием проекта и инструкциями по установке и запуску
4. Проект готов для начала разработки

## Критерии приемки

1. Структура проекта соответствует требованиям
2. Все конфигурационные файлы созданы и содержат корректные данные
3. README.md файлы содержат полную информацию о проекте и инструкции по установке и запуску
4. Проект можно клонировать и начать разработку без дополнительной настройки