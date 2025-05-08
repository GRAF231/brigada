# Product Context
      
This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-05-08 11:24:00 - Log of updates made will be appended as footnotes to the end of this file.

*

## Project Goal

* Создать сервис для управления ремонтом квартир, который позволит отслеживать статус ремонта и баланс взаиморасчётов между заказчиком, компанией и мастерами.

## Key Features

* **Взаиморасчеты и смета** - иерархический список работ с возможностью развернуть пункты и увидеть подпункты, статусы выполнения и финансирования.
* **График работ** - интерактивный график Ганта для отслеживания прогресса работ.
* **Текущий статус и история статусов** - обновляемый список сообщений от сотрудников сервиса.
* **Автоматический расчет смет** - обработка PDF файлов дизайн-проектов и формирование сметы.
* **Система пользователей и ролей** - различные роли пользователей с разными уровнями доступа.

## Overall Architecture

* **Фронтенд**: React, PWA, Material-UI
* **Бэкенд**: Node.js, Express
* **База данных**: MongoDB
* **Аутентификация**: JWT
* **Дополнительные технологии**: PDF.js, React-Gantt, Workbox

2025-05-08 11:24:00 - Инициализация Memory Bank и создание начального описания проекта на основе требований пользователя.