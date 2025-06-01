import axios from 'axios';
import { 
  Project, 
  User, 
  EstimateItem, 
  ScheduleItem, 
  StatusMessage, 
  Attachment 
} from '../types/project';

// Базовый URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок авторизации (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API для работы с проектами
export const projectApi = {
  // Получение списка проектов
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Получение проекта по ID
  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Создание нового проекта
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Обновление проекта
  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Удаление проекта
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Получение участников проекта
  getProjectUsers: async (id: string): Promise<User[]> => {
    const response = await api.get(`/projects/${id}/users`);
    return response.data;
  },

  // Добавление пользователя в проект
  addProjectUser: async (projectId: string, userData: { userId: string, role: string }): Promise<void> => {
    await api.post(`/projects/${projectId}/users`, userData);
  },
  
  // Поиск пользователей по роли
  searchUsers: async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/search`, {
      params: { role }
    });
    return response.data;
  }
};

// API для работы со сметами
export const estimateApi = {
  // Получение сметы проекта
  getProjectEstimate: async (projectId: string): Promise<{ id: string, items: EstimateItem[] }> => {
    const response = await api.get(`/projects/${projectId}/estimate`);
    return response.data;
  },

  // Создание сметы для проекта
  createProjectEstimate: async (projectId: string): Promise<{ id: string }> => {
    const response = await api.post(`/projects/${projectId}/estimate`);
    return response.data;
  },

  // Добавление позиции в смету
  addEstimateItem: async (estimateId: string, itemData: Partial<EstimateItem>): Promise<EstimateItem> => {
    const response = await api.post(`/estimates/${estimateId}/items`, itemData);
    return response.data;
  },

  // Обновление позиции сметы
  updateEstimateItem: async (itemId: string, itemData: Partial<EstimateItem>): Promise<EstimateItem> => {
    const response = await api.put(`/estimate-items/${itemId}`, itemData);
    return response.data;
  },

  // Обновление статуса позиции сметы
  updateEstimateItemStatus: async (itemId: string, status: string): Promise<EstimateItem> => {
    const response = await api.patch(`/estimate-items/${itemId}/status`, { status });
    return response.data;
  },

  // Удаление позиции сметы
  deleteEstimateItem: async (itemId: string): Promise<void> => {
    await api.delete(`/estimate-items/${itemId}`);
  }
};

// API для работы с графиками работ
export const scheduleApi = {
  // Получение графика работ проекта
  getProjectSchedule: async (projectId: string): Promise<{ id: string, items: ScheduleItem[] }> => {
    const response = await api.get(`/projects/${projectId}/schedule`);
    return response.data;
  },

  // Создание графика работ для проекта
  createProjectSchedule: async (projectId: string): Promise<{ id: string }> => {
    const response = await api.post(`/projects/${projectId}/schedule`);
    return response.data;
  },

  // Добавление работы в график
  addScheduleItem: async (scheduleId: string, itemData: Partial<ScheduleItem>): Promise<ScheduleItem> => {
    const response = await api.post(`/schedules/${scheduleId}/items`, itemData);
    return response.data;
  },

  // Обновление работы в графике
  updateScheduleItem: async (itemId: string, itemData: Partial<ScheduleItem>): Promise<ScheduleItem> => {
    const response = await api.put(`/schedule-items/${itemId}`, itemData);
    return response.data;
  },

  // Обновление статуса работы
  updateScheduleItemStatus: async (itemId: string, status: string): Promise<ScheduleItem> => {
    const response = await api.patch(`/schedule-items/${itemId}/status`, { status });
    return response.data;
  },

  // Удаление работы из графика
  deleteScheduleItem: async (itemId: string): Promise<void> => {
    await api.delete(`/schedule-items/${itemId}`);
  }
};

// API для работы со статусами
export const statusApi = {
  // Получение истории статусов проекта
  getProjectStatusMessages: async (projectId: string, page: number = 1, limit: number = 10): Promise<{
    statusMessages: StatusMessage[];
    page: number;
    pages: number;
    total: number;
  }> => {
    const response = await api.get(`/projects/${projectId}/status`, {
      params: { page, limit }
    });
    
    // Преобразуем данные с сервера в формат клиента
    const statusMessages = response.data.statusMessages.map((message: any) => ({
      ...message,
      _id: message._id,
      attachments: message.attachments ? message.attachments.map((attachment: any) => ({
        _id: attachment._id || attachment.filename,
        fileName: attachment.originalname,
        fileType: attachment.mimetype,
        fileUrl: statusApi.getAttachmentUrl(attachment.filename)
      })) : []
    }));
    
    return {
      ...response.data,
      statusMessages
    };
  },

  // Создание сообщения о статусе
  createStatusMessage: async (projectId: string, message: string): Promise<StatusMessage> => {
    const response = await api.post(`/projects/${projectId}/status`, { message });
    // Преобразуем данные с сервера в формат клиента
    return {
      ...response.data,
      _id: response.data._id,
      attachments: []
    };
  },

  // Загрузка файлов для сообщения
  uploadAttachments: async (messageId: string, files: File[]): Promise<StatusMessage> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post(`/status-messages/${messageId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Преобразуем данные с сервера в формат клиента
    return {
      ...response.data,
      _id: response.data._id,
      attachments: response.data.attachments ? response.data.attachments.map((attachment: any) => ({
        _id: attachment._id || attachment.filename,
        fileName: attachment.originalname,
        fileType: attachment.mimetype,
        fileUrl: statusApi.getAttachmentUrl(attachment.filename)
      })) : []
    };
  },

  // Удаление сообщения о статусе
  deleteStatusMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/status-messages/${messageId}`);
  },

  // Получение URL файла вложения
  getAttachmentUrl: (filename: string): string => {
    return `${API_URL}/attachments/${filename}`;
  }
};

export default api;