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
import { Project, EstimateItem, UserRole } from '../../types/project';
import { estimateApi } from '../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { buildHierarchy, EstimateItemStatus } from './estimate/estimateUtils';
import { EstimateItemFormData } from './estimate/types';
import AddEstimateItemDialog from './estimate/AddEstimateItemDialog';
import EditEstimateItemDialog from './estimate/EditEstimateItemDialog';
import DeleteEstimateItemDialog from './estimate/DeleteEstimateItemDialog';
import ChangeStatusDialog from './estimate/ChangeStatusDialog';
import EstimateTable from './estimate/EstimateTable';

interface EstimateTabProps {
  project: Project;
}

const EstimateTab: React.FC<EstimateTabProps> = ({ project }) => {
  // Состояние для хранения данных сметы
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для модальных окон
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openStatusDialog, setOpenStatusDialog] = useState<boolean>(false);
  
  // Состояние для выбранной позиции сметы
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  
  // Состояние для формы
  const [formData, setFormData] = useState<EstimateItemFormData>({
    name: '',
    unit: 'шт',
    quantity: 1,
    price: 0,
    status: EstimateItemStatus.PENDING
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

  // Загрузка данных сметы
  const fetchEstimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await estimateApi.getProjectEstimate(project._id);
      setEstimateId(response.id);
      setEstimateItems(response.items);
    } catch (err) {
      console.error('Ошибка при загрузке сметы:', err);
      setError('Не удалось загрузить смету. Пожалуйста, попробуйте позже.');
      
      // Если сметы нет, создаем новую (только для пользователей с правами)
      if (canEdit) {
        try {
          const newEstimate = await estimateApi.createProjectEstimate(project._id);
          setEstimateId(newEstimate.id);
          setEstimateItems([]);
          setSnackbar({
            open: true,
            message: 'Создана новая смета для проекта',
            severity: 'success'
          });
        } catch (createErr) {
          console.error('Ошибка при создании сметы:', createErr);
          setError('Не удалось создать смету. Пожалуйста, попробуйте позже.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchEstimate();
  }, [project._id]);

  // Обработчики для модальных окон
  const handleOpenAddDialog = (parentId?: string) => {
    setSelectedParentId(parentId);
    setFormData({
      name: '',
      unit: 'шт',
      quantity: 1,
      price: 0,
      status: EstimateItemStatus.PENDING
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (item: EstimateItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      status: item.status
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (item: EstimateItem) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleOpenStatusDialog = (item: EstimateItem) => {
    setSelectedItem(item);
    setFormData({ ...formData, status: item.status });
    setOpenStatusDialog(true);
  };

  // Обработчик для изменения формы
  const handleFormChange = (field: keyof EstimateItemFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Обработчики для API запросов
  const handleAddItem = async () => {
    if (!estimateId) return;
    
    try {
      const newItem = await estimateApi.addEstimateItem(estimateId, {
        ...formData,
        parentId: selectedParentId,
        amount: (formData.quantity || 0) * (formData.price || 0)
      });
      
      // Обновляем список позиций
      setEstimateItems(prev => [...prev, newItem]);
      
      setSnackbar({
        open: true,
        message: 'Позиция успешно добавлена',
        severity: 'success'
      });
      
      setOpenAddDialog(false);
    } catch (err) {
      console.error('Ошибка при добавлении позиции:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось добавить позицию',
        severity: 'error'
      });
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    
    try {
      const updatedItem = await estimateApi.updateEstimateItem(selectedItem._id, {
        ...formData,
        amount: (formData.quantity || 0) * (formData.price || 0)
      });
      
      // Обновляем список позиций
      setEstimateItems(prev => 
        prev.map(item => item._id === updatedItem._id ? updatedItem : item)
      );
      
      setSnackbar({
        open: true,
        message: 'Позиция успешно обновлена',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Ошибка при обновлении позиции:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось обновить позицию',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      await estimateApi.deleteEstimateItem(selectedItem._id);
      
      // Обновляем список позиций
      setEstimateItems(prev => 
        prev.filter(item => item._id !== selectedItem._id)
      );
      
      setSnackbar({
        open: true,
        message: 'Позиция успешно удалена',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Ошибка при удалении позиции:', err);
      setSnackbar({
        open: true,
        message: 'Не удалось удалить позицию',
        severity: 'error'
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    
    try {
      const updatedItem = await estimateApi.updateEstimateItemStatus(
        selectedItem._id, 
        formData.status
      );
      
      // Обновляем список позиций
      setEstimateItems(prev => 
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

  // Подготовка данных для таблицы
  const hierarchicalItems = useMemo(() => buildHierarchy(estimateItems), [estimateItems]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Смета проекта
          </Typography>
          {canEdit && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddDialog()}
            >
              Добавить позицию
            </Button>
          )}
        </Box>

        <EstimateTable 
          items={hierarchicalItems}
          loading={loading}
          error={error}
          canEdit={canEdit}
          canChangeStatus={canChangeStatus}
          onAddSubItem={handleOpenAddDialog}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
          onChangeStatus={handleOpenStatusDialog}
        />
      </Paper>

      {/* Диалоги */}
      <AddEstimateItemDialog 
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddItem}
        formData={formData}
        onFormChange={handleFormChange}
      />

      <EditEstimateItemDialog 
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleEditItem}
        formData={formData}
        onFormChange={handleFormChange}
      />

      <DeleteEstimateItemDialog 
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

export default EstimateTab;