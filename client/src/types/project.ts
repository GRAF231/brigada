// Типы для данных проекта и пользователей

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  _id: string;
  name: string;
  address: string;
  status: string;
  startDate: string;
  endDate: string;
  clientId: string;
  managerId: string;
}

export enum ProjectStatus {
  PLANNING = 'planning', // Планирование
  IN_PROGRESS = 'in_progress', // В процессе
  ON_HOLD = 'on_hold', // Приостановлен
  COMPLETED = 'completed', // Завершен
  CANCELLED = 'cancelled' // Отменен
}

export enum UserRole {
  CLIENT = 'client', // Заказчик
  MANAGER = 'manager', // НеБригадир
  EXPERT = 'expert', // Эксперт-приёмщик
  COORDINATOR = 'coordinator', // Координатор
  MASTER = 'master', // Мастер
  DESIGNER = 'designer' // Дизайнер
}

export interface EstimateItem {
  _id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  status: string;
  parentId?: string;
  children?: EstimateItem[];
}

export interface ScheduleItem {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface StatusMessage {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  _id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
}