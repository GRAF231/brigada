import { EstimateItem } from '../../../types/project';

// Статусы позиций сметы
export enum EstimateItemStatus {
  PENDING = 'pending', // Ожидает
  APPROVED = 'approved', // Утверждено
  IN_PROGRESS = 'in_progress', // В процессе
  COMPLETED = 'completed', // Выполнено
  CANCELLED = 'cancelled' // Отменено
}

// Цвета для статусов
export const statusColors = {
  [EstimateItemStatus.PENDING]: '#FFC107', // Желтый
  [EstimateItemStatus.APPROVED]: '#2196F3', // Синий
  [EstimateItemStatus.IN_PROGRESS]: '#9C27B0', // Фиолетовый
  [EstimateItemStatus.COMPLETED]: '#4CAF50', // Зеленый
  [EstimateItemStatus.CANCELLED]: '#F44336' // Красный
};

// Названия статусов на русском
export const statusNames = {
  [EstimateItemStatus.PENDING]: 'Ожидает',
  [EstimateItemStatus.APPROVED]: 'Утверждено',
  [EstimateItemStatus.IN_PROGRESS]: 'В процессе',
  [EstimateItemStatus.COMPLETED]: 'Выполнено',
  [EstimateItemStatus.CANCELLED]: 'Отменено'
};

// Функция для преобразования плоского списка в иерархичную структуру
export const buildHierarchy = (items: EstimateItem[]): EstimateItem[] => {
  const itemMap: Record<string, EstimateItem> = {};
  const rootItems: EstimateItem[] = [];
  
  // Создаем карту всех элементов по id
  items.forEach(item => {
    itemMap[item._id] = { ...item, children: [] };
  });
  
  // Строим иерархию
  items.forEach(item => {
    if (item.parentId && itemMap[item.parentId]) {
      if (!itemMap[item.parentId].children) {
        itemMap[item.parentId].children = [];
      }
      itemMap[item.parentId].children!.push(itemMap[item._id]);
    } else {
      rootItems.push(itemMap[item._id]);
    }
  });
  
  return rootItems;
};

// Единицы измерения
export const unitOptions = [
  { value: 'шт', label: 'шт' },
  { value: 'м', label: 'м' },
  { value: 'м²', label: 'м²' },
  { value: 'м³', label: 'м³' },
  { value: 'кг', label: 'кг' },
  { value: 'компл', label: 'компл' }
];