import { ScheduleItem } from '../../../types/project';

// Статусы работ
export enum ScheduleItemStatus {
  NOT_STARTED = 'not_started', // Не начато
  IN_PROGRESS = 'in_progress', // В процессе
  DELAYED = 'delayed', // Задержка
  COMPLETED = 'completed', // Завершено
  CANCELLED = 'cancelled' // Отменено
}

// Цвета для статусов
export const statusColors = {
  [ScheduleItemStatus.NOT_STARTED]: '#2196F3', // Синий
  [ScheduleItemStatus.IN_PROGRESS]: '#9C27B0', // Фиолетовый
  [ScheduleItemStatus.DELAYED]: '#FFC107', // Желтый
  [ScheduleItemStatus.COMPLETED]: '#4CAF50', // Зеленый
  [ScheduleItemStatus.CANCELLED]: '#F44336' // Красный
};

// Названия статусов на русском
export const statusNames = {
  [ScheduleItemStatus.NOT_STARTED]: 'Не начато',
  [ScheduleItemStatus.IN_PROGRESS]: 'В процессе',
  [ScheduleItemStatus.DELAYED]: 'Задержка',
  [ScheduleItemStatus.COMPLETED]: 'Завершено',
  [ScheduleItemStatus.CANCELLED]: 'Отменено'
};

// Форматирование даты для отображения
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Преобразование даты в формат ISO для отправки на сервер
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Преобразование данных для диаграммы Ганта
export const prepareGanttData = (items: ScheduleItem[]) => {
  return items.map((item, index) => ({
    id: item._id,
    name: item.name,
    start: new Date(item.startDate),
    end: new Date(item.endDate),
    progress: getProgressByStatus(item.status),
    type: 'task',
    styles: { progressColor: statusColors[item.status as ScheduleItemStatus] || '#ccc' }
  }));
};

// Получение прогресса по статусу
export const getProgressByStatus = (status: string): number => {
  switch (status) {
    case ScheduleItemStatus.NOT_STARTED:
      return 0;
    case ScheduleItemStatus.IN_PROGRESS:
      return 50;
    case ScheduleItemStatus.DELAYED:
      return 30;
    case ScheduleItemStatus.COMPLETED:
      return 100;
    case ScheduleItemStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
};