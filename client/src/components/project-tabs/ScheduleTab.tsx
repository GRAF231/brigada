import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Project, ScheduleItem, UserRole } from '../../types/project';
import { scheduleApi } from '../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { ScheduleItemStatus, toISODateString } from './schedule/scheduleUtils';
import { ScheduleItemFormData } from './schedule/types';
import AddScheduleItemDialog from './schedule/AddScheduleItemDialog';
import EditScheduleItemDialog from './schedule/EditScheduleItemDialog';
import DeleteScheduleItemDialog from './schedule/DeleteScheduleItemDialog';
import ChangeStatusDialog from './schedule/ChangeStatusDialog';
import GanttChart from './schedule/GanttChart';

interface ScheduleTabProps {
  project: Project;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ project }) => {
  // Состояние для хранения данных графика работ
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для модальных окон
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openStatusDialog, setOpenStatusDialog] = useState<boolean>(false);
  
  // Состояние для выбранной работы
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  
  // Состояние для формы
  const [formData, setFormData] = useState<ScheduleItemFormData>({
    name: '',
    startDate: toISODateString(new Date()),
    endDate: toISODateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +7 дней
    status: ScheduleItemStatus.NOT_STARTED
  });
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Получаем информацию о текущем пользователе из Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Проверяем, имеет ли пользователь права на редактирование
  const canEdit = Boolean(user && (
    user.role === UserRole.MANAGER || 
    user.role === UserRole.COORDINATOR
  ));
  
  // Проверяем, имеет ли пользователь права на изменение статуса
  const canChangeStatus = Boolean(user && (
    user.role === UserRole.MANAGER || 
    user.role === UserRole.COORDINATOR || 
    user.role === UserRole.EXPERT
  ));

  // Загрузка данных графика работ
  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleApi.getProjectSchedule(project._id);
      setScheduleId(response.id);
      setScheduleItems(response.items);
    } catch (err) {
      console.error('Ошибка при загрузке графика работ:', err);
      setError('Не удалось загрузить график работ. Пожалуйста, попробуйте позже.');
      
      // Если графика работ нет, создаем новый (только для пользователей с правами)
      if (canEdit) {
        try {
          const newSchedule = await scheduleApi.createProjectSchedule(project._id);
          setScheduleId(newSchedule.id);
          setScheduleItems([]);
          setSnackbar({
            open: true,
            message: 'Создан новый график работ для проекта',
            severity: 'success'
          });
        } catch (createErr) {
          console.error('Ошибка при создании графика работ:', createErr);
          setError('Не удалось создать график работ. Пожалуйста, попробуйте позже.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchSchedule();
  }, [project._id]);

  // Обработчики для модальных окон
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      startDate: toISODateString(new Date()),
      endDate: toISODateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +7 дней
      status: ScheduleItemStatus.NOT_STARTED
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (item: ScheduleItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      startDate: item.startDate.split('T')[0], // Убираем время из ISO строки
      endDate: item.endDate.split('T')[0], // Убираем время из ISO строки
      status: item.status
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (item: ScheduleItem) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleOpenStatusDialog = (item: ScheduleItem) => {
    setSelectedItem(item);
    setFormData({ ...formData, status: item.status });
    setOpenStatusDialog(true);
  };

  // Обработчик для изменения формы
  const handleFormChange = (field: keyof ScheduleItemFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Обработчики для API запросов
  const handleAddItem = async () => {
    if (!scheduleId) return;
    
    try {
      const newItem = await scheduleApi.addScheduleItem(scheduleId, formData);
      
      // Обновляем список работ
      setScheduleItems(prev => [...prev, newItem]);
      
      setSnackbar({
        open: true,
        message: 'Работа успешно добавлена',
        severity: 'success'
      });
      
      setOpenAddDialog(false);
    } catch (err) {
      console.error('Ошибка при добавлении работы:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось добавить работу',
        severity: 'error'
      });
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    
    try {
      const updatedItem = await scheduleApi.updateScheduleItem(selectedItem._id, formData);
      
      // Обновляем список работ
      setScheduleItems(prev => 
        prev.map(item => item._id === updatedItem._id ? updatedItem : item)
      );
      
      setSnackbar({
        open: true,
        message: 'Работа успешно обновлена',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Ошибка при обновлении работы:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось обновить работу',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      await scheduleApi.deleteScheduleItem(selectedItem._id);
      
      // Обновляем список работ
      setScheduleItems(prev => 
        prev.filter(item => item._id !== selectedItem._id)
      );
      
      setSnackbar({
        open: true,
        message: 'Работа успешно удалена',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Ошибка при удалении работы:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось удалить работу',
        severity: 'error'
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    
    try {
      const updatedItem = await scheduleApi.updateScheduleItemStatus(
        selectedItem._id, 
        formData.status
      );
      
      // Обновляем список работ
      setScheduleItems(prev => 
        prev.map(item => item._id === updatedItem._id ? updatedItem : item)
      );
      
      setSnackbar({
        open: true,
        message: 'Статус успешно обновлен',
        severity: 'success'
      });
      
      setOpenStatusDialog(false);
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось обновить статус',
        severity: 'error'
      });
    }
  };

  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Обработчик клика по работе в диаграмме Ганта
  const handleTaskClick = (item: ScheduleItem) => {
    if (canEdit) {
      handleOpenEditDialog(item);
    } else if (canChangeStatus) {
      handleOpenStatusDialog(item);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            График работ
          </Typography>
          {canEdit && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Добавить работу
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <GanttChart 
            items={scheduleItems}
            onTaskClick={handleTaskClick}
          />
        )}
      </Paper>

      {/* Диалоги */}
      <AddScheduleItemDialog 
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddItem}
        formData={formData}
        onFormChange={handleFormChange}
      />

      <EditScheduleItemDialog 
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleEditItem}
        formData={formData}
        onFormChange={handleFormChange}
      />

      <DeleteScheduleItemDialog 
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        item={selectedItem}
        onDelete={handleDeleteItem}
      />

      <ChangeStatusDialog 
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleUpdateStatus}
      />

      {/* Уведомление */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleTab;