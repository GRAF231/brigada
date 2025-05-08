# Задача 2: Проектирование схемы базы данных MongoDB

## Описание задачи
Необходимо спроектировать детальную схему базы данных MongoDB для сервиса управления ремонтом квартир. Схема должна включать все необходимые коллекции, их структуру и связи между ними для реализации требуемого функционала.

## Требования к функционалу

### 1. Взаиморасчеты и смета
- Иерархический список работ с возможностью развернуть пункты и увидеть подпункты
- Информация о единицах измерения, количестве, цене и сумме для каждого пункта
- Статусы пунктов сметы: "профинансировано", "выполнено", "переделываем", "принято"
- Разные прайс-листы для заказчиков и мастеров

### 2. График работ
- Задачи с датами начала и окончания
- Статусы выполнения задач
- Назначение ответственных исполнителей
- Возможность группировки задач

### 3. Текущий статус и история статусов
- Сообщения от сотрудников сервиса с датой и временем
- Возможность прикрепления фото, видео, документов и ссылок к сообщениям
- Комментарии к сообщениям

### 4. Пользователи и роли
- Роли пользователей: Заказчик, НеБригадир, Эксперт-приёмщик, Координатор, Мастер, Дизайнер
- Разные уровни доступа к информации в зависимости от роли
- Возможность добавления пользователей в проекты

### 5. Автоматический расчет смет
- Обработка PDF файлов дизайн-проектов
- Извлечение данных и формирование сметы

## Требования к схеме базы данных

### Коллекции

1. **users** - пользователи системы
2. **projects** - проекты ремонта
3. **project_users** - связь между проектами и пользователями
4. **estimate_items** - пункты сметы
5. **schedule_items** - задачи в графике работ
6. **status_messages** - сообщения о статусе проекта
7. **message_attachments** - вложения к сообщениям
8. **message_comments** - комментарии к сообщениям
9. **price_lists** - прайс-листы
10. **price_list_items** - позиции прайс-листов
11. **pdf_documents** - загруженные PDF документы дизайн-проектов

### Детальное описание коллекций

#### 1. users
Коллекция для хранения информации о пользователях системы.

Поля:
- `_id`: ObjectId - уникальный идентификатор пользователя
- `email`: String (required, unique) - email пользователя
- `password`: String (required) - хешированный пароль
- `name`: String (required) - имя пользователя
- `phone`: String - телефон пользователя
- `role`: String (enum: ['customer', 'not_brigadier', 'expert', 'coordinator', 'master', 'designer']) - роль пользователя
- `avatar`: String - URL аватара пользователя
- `created_at`: Date - дата создания пользователя
- `updated_at`: Date - дата обновления пользователя
- `last_login`: Date - дата последнего входа

Индексы:
- `email`: unique
- `role`: 1

#### 2. projects
Коллекция для хранения информации о проектах ремонта.

Поля:
- `_id`: ObjectId - уникальный идентификатор проекта
- `title`: String (required) - название проекта
- `description`: String - описание проекта
- `address`: String (required) - адрес объекта
- `status`: String (enum: ['planning', 'in_progress', 'on_hold', 'completed']) - статус проекта
- `start_date`: Date - дата начала проекта
- `end_date`: Date - дата окончания проекта
- `created_by`: ObjectId (ref: 'users') - создатель проекта
- `created_at`: Date - дата создания проекта
- `updated_at`: Date - дата обновления проекта

Индексы:
- `created_by`: 1
- `status`: 1
- `start_date`: 1
- `end_date`: 1

#### 3. project_users
Коллекция для хранения связей между проектами и пользователями.

Поля:
- `_id`: ObjectId - уникальный идентификатор связи
- `project_id`: ObjectId (ref: 'projects', required) - идентификатор проекта
- `user_id`: ObjectId (ref: 'users', required) - идентификатор пользователя
- `role`: String (enum: ['customer', 'not_brigadier', 'expert', 'coordinator', 'master', 'designer']) - роль пользователя в проекте
- `added_at`: Date - дата добавления пользователя в проект
- `added_by`: ObjectId (ref: 'users') - кто добавил пользователя в проект

Индексы:
- `project_id`: 1
- `user_id`: 1
- Составной индекс: `{ project_id: 1, user_id: 1 }` (unique)

#### 4. estimate_items
Коллекция для хранения пунктов сметы.

Поля:
- `_id`: ObjectId - уникальный идентификатор пункта сметы
- `project_id`: ObjectId (ref: 'projects', required) - идентификатор проекта
- `parent_id`: ObjectId (ref: 'estimate_items') - идентификатор родительского пункта (для иерархии)
- `title`: String (required) - название пункта
- `description`: String - описание пункта
- `unit`: String - единица измерения
- `quantity`: Number - количество
- `price_customer`: Number - цена для заказчика
- `price_master`: Number - цена для мастера
- `total_customer`: Number - общая сумма для заказчика (quantity * price_customer)
- `total_master`: Number - общая сумма для мастера (quantity * price_master)
- `status_finance`: String (enum: ['not_financed', 'financed']) - статус финансирования
- `status_execution`: String (enum: ['not_started', 'in_progress', 'completed', 'rework', 'accepted']) - статус выполнения
- `order`: Number - порядок отображения
- `created_at`: Date - дата создания пункта
- `updated_at`: Date - дата обновления пункта
- `created_by`: ObjectId (ref: 'users') - кто создал пункт
- `updated_by`: ObjectId (ref: 'users') - кто обновил пункт

Индексы:
- `project_id`: 1
- `parent_id`: 1
- Составной индекс: `{ project_id: 1, parent_id: 1, order: 1 }`

#### 5. schedule_items
Коллекция для хранения задач в графике работ.

Поля:
- `_id`: ObjectId - уникальный идентификатор задачи
- `project_id`: ObjectId (ref: 'projects', required) - идентификатор проекта
- `title`: String (required) - название задачи
- `description`: String - описание задачи
- `start_date`: Date (required) - дата начала задачи
- `end_date`: Date (required) - дата окончания задачи
- `status`: String (enum: ['not_started', 'in_progress', 'completed', 'delayed']) - статус задачи
- `responsible_user_id`: ObjectId (ref: 'users') - ответственный за задачу
- `dependencies`: [ObjectId] (ref: 'schedule_items') - зависимости от других задач
- `group`: String - группа задач
- `order`: Number - порядок отображения
- `created_at`: Date - дата создания задачи
- `updated_at`: Date - дата обновления задачи
- `created_by`: ObjectId (ref: 'users') - кто создал задачу
- `updated_by`: ObjectId (ref: 'users') - кто обновил задачу

Индексы:
- `project_id`: 1
- `responsible_user_id`: 1
- `start_date`: 1
- `end_date`: 1
- Составной индекс: `{ project_id: 1, group: 1, order: 1 }`

#### 6. status_messages
Коллекция для хранения сообщений о статусе проекта.

Поля:
- `_id`: ObjectId - уникальный идентификатор сообщения
- `project_id`: ObjectId (ref: 'projects', required) - идентификатор проекта
- `user_id`: ObjectId (ref: 'users', required) - идентификатор пользователя, создавшего сообщение
- `message`: String (required) - текст сообщения
- `created_at`: Date - дата создания сообщения
- `updated_at`: Date - дата обновления сообщения

Индексы:
- `project_id`: 1
- `user_id`: 1
- `created_at`: -1

#### 7. message_attachments
Коллекция для хранения вложений к сообщениям.

Поля:
- `_id`: ObjectId - уникальный идентификатор вложения
- `message_id`: ObjectId (ref: 'status_messages', required) - идентификатор сообщения
- `type`: String (enum: ['image', 'video', 'document', 'link']) - тип вложения
- `url`: String (required) - URL вложения
- `filename`: String - имя файла
- `size`: Number - размер файла в байтах
- `mime_type`: String - MIME-тип файла
- `created_at`: Date - дата создания вложения

Индексы:
- `message_id`: 1
- `type`: 1

#### 8. message_comments
Коллекция для хранения комментариев к сообщениям.

Поля:
- `_id`: ObjectId - уникальный идентификатор комментария
- `message_id`: ObjectId (ref: 'status_messages', required) - идентификатор сообщения
- `user_id`: ObjectId (ref: 'users', required) - идентификатор пользователя, создавшего комментарий
- `comment`: String (required) - текст комментария
- `created_at`: Date - дата создания комментария
- `updated_at`: Date - дата обновления комментария

Индексы:
- `message_id`: 1
- `user_id`: 1
- `created_at`: 1

#### 9. price_lists
Коллекция для хранения прайс-листов.

Поля:
- `_id`: ObjectId - уникальный идентификатор прайс-листа
- `name`: String (required) - название прайс-листа
- `description`: String - описание прайс-листа
- `type`: String (enum: ['customer', 'master']) - тип прайс-листа (для заказчиков или мастеров)
- `is_active`: Boolean - активен ли прайс-лист
- `created_at`: Date - дата создания прайс-листа
- `updated_at`: Date - дата обновления прайс-листа
- `created_by`: ObjectId (ref: 'users') - кто создал прайс-лист
- `updated_by`: ObjectId (ref: 'users') - кто обновил прайс-лист

Индексы:
- `type`: 1
- `is_active`: 1

#### 10. price_list_items
Коллекция для хранения позиций прайс-листов.

Поля:
- `_id`: ObjectId - уникальный идентификатор позиции
- `price_list_id`: ObjectId (ref: 'price_lists', required) - идентификатор прайс-листа
- `category`: String - категория работ/материалов
- `subcategory`: String - подкатегория работ/материалов
- `title`: String (required) - название позиции
- `description`: String - описание позиции
- `unit`: String (required) - единица измерения
- `price`: Number (required) - цена
- `order`: Number - порядок отображения
- `created_at`: Date - дата создания позиции
- `updated_at`: Date - дата обновления позиции

Индексы:
- `price_list_id`: 1
- `category`: 1
- `subcategory`: 1
- Составной индекс: `{ price_list_id: 1, category: 1, subcategory: 1, order: 1 }`
- Текстовый индекс: `{ title: 'text', description: 'text' }`

#### 11. pdf_documents
Коллекция для хранения загруженных PDF документов дизайн-проектов.

Поля:
- `_id`: ObjectId - уникальный идентификатор документа
- `project_id`: ObjectId (ref: 'projects', required) - идентификатор проекта
- `name`: String (required) - название документа
- `description`: String - описание документа
- `file_path`: String (required) - путь к файлу
- `file_size`: Number - размер файла в байтах
- `processed`: Boolean - обработан ли документ
- `processing_status`: String (enum: ['pending', 'processing', 'completed', 'failed']) - статус обработки
- `processing_error`: String - ошибка обработки
- `created_at`: Date - дата создания документа
- `updated_at`: Date - дата обновления документа
- `uploaded_by`: ObjectId (ref: 'users') - кто загрузил документ

Индексы:
- `project_id`: 1
- `processed`: 1
- `processing_status`: 1
- `created_at`: -1

## Связи между коллекциями

1. `users` и `projects`:
   - Один пользователь может создать много проектов
   - Связь через поле `created_by` в коллекции `projects`

2. `users` и `project_users`:
   - Один пользователь может участвовать во многих проектах
   - Связь через поле `user_id` в коллекции `project_users`

3. `projects` и `project_users`:
   - Один проект может иметь много участников
   - Связь через поле `project_id` в коллекции `project_users`

4. `projects` и `estimate_items`:
   - Один проект может иметь много пунктов сметы
   - Связь через поле `project_id` в коллекции `estimate_items`

5. `estimate_items` и `estimate_items` (самосвязь):
   - Один пункт сметы может иметь много подпунктов
   - Связь через поле `parent_id` в коллекции `estimate_items`

6. `projects` и `schedule_items`:
   - Один проект может иметь много задач в графике работ
   - Связь через поле `project_id` в коллекции `schedule_items`

7. `users` и `schedule_items`:
   - Один пользователь может быть ответственным за много задач
   - Связь через поле `responsible_user_id` в коллекции `schedule_items`

8. `schedule_items` и `schedule_items` (самосвязь):
   - Одна задача может зависеть от многих других задач
   - Связь через поле `dependencies` в коллекции `schedule_items`

9. `projects` и `status_messages`:
   - Один проект может иметь много сообщений о статусе
   - Связь через поле `project_id` в коллекции `status_messages`

10. `users` и `status_messages`:
    - Один пользователь может создать много сообщений
    - Связь через поле `user_id` в коллекции `status_messages`

11. `status_messages` и `message_attachments`:
    - Одно сообщение может иметь много вложений
    - Связь через поле `message_id` в коллекции `message_attachments`

12. `status_messages` и `message_comments`:
    - Одно сообщение может иметь много комментариев
    - Связь через поле `message_id` в коллекции `message_comments`

13. `users` и `message_comments`:
    - Один пользователь может создать много комментариев
    - Связь через поле `user_id` в коллекции `message_comments`

14. `price_lists` и `price_list_items`:
    - Один прайс-лист может иметь много позиций
    - Связь через поле `price_list_id` в коллекции `price_list_items`

15. `projects` и `pdf_documents`:
    - Один проект может иметь много PDF документов
    - Связь через поле `project_id` в коллекции `pdf_documents`

16. `users` и `pdf_documents`:
    - Один пользователь может загрузить много PDF документов
    - Связь через поле `uploaded_by` в коллекции `pdf_documents`

## Ожидаемый результат

1. Детальная схема базы данных MongoDB, включающая все необходимые коллекции, их структуру и связи между ними
2. Описание полей для каждой коллекции с указанием типов данных, обязательности и других ограничений
3. Описание индексов для оптимизации запросов
4. Описание связей между коллекциями

## Критерии приемки

1. Схема базы данных соответствует требованиям к функционалу
2. Все необходимые коллекции, поля и связи определены
3. Индексы определены для оптимизации запросов
4. Схема учитывает особенности MongoDB и NoSQL подхода
5. Схема позволяет эффективно реализовать все требуемые функции системы