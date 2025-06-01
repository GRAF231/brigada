import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { createProject, resetProjectSuccess } from '../features/projects/projectSlice';
import { projectApi } from '../utils/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ru } from 'date-fns/locale';
import { ProjectStatus, User } from '../types/project';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, error, success } = useAppSelector((state) => state.projects);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [status, setStatus] = useState<string>(ProjectStatus.PLANNING);
  const [clientId, setClientId] = useState<string>(user?.role === 'client' ? user?._id : '');
  const [managerId, setManagerId] = useState<string>(user?.role === 'manager' ? user?._id : '');
  
  const [clients, setClients] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [clientIdError, setClientIdError] = useState('');
  const [managerIdError, setManagerIdError] = useState('');

  // Загрузка списка клиентов и менеджеров
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Загрузка клиентов
        const clientsResponse = await projectApi.searchUsers('client');
        setClients(clientsResponse);
        
        // Загрузка менеджеров
        const managersResponse = await projectApi.searchUsers('manager');
        setManagers(managersResponse);
        
        // Устанавливаем значения по умолчанию
        if (!clientId && clientsResponse.length > 0) {
          setClientId(clientsResponse[0]._id);
        }
        
        if (!managerId && managersResponse.length > 0) {
          setManagerId(managersResponse[0]._id);
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [clientId, managerId]);

  // Перенаправление после успешного создания проекта
  useEffect(() => {
    if (success) {
      dispatch(resetProjectSuccess());
      navigate('/');
    }
  }, [success, dispatch, navigate]);

  // Валидация формы
  const validateForm = () => {
    let isValid = true;
    
    // Валидация названия
    if (!name.trim()) {
      setNameError('Пожалуйста, укажите название проекта');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Валидация адреса
    if (!address.trim()) {
      setAddressError('Пожалуйста, укажите адрес');
      isValid = false;
    } else {
      setAddressError('');
    }
    
    // Валидация даты начала
    if (!startDate) {
      setStartDateError('Пожалуйста, укажите дату начала');
      isValid = false;
    } else {
      setStartDateError('');
    }
    
    // Валидация даты окончания
    if (!endDate) {
      setEndDateError('Пожалуйста, укажите дату окончания');
      isValid = false;
    } else if (startDate && endDate && endDate < startDate) {
      setEndDateError('Дата окончания не может быть раньше даты начала');
      isValid = false;
    } else {
      setEndDateError('');
    }
    
    // Валидация клиента
    if (!clientId) {
      setClientIdError('Пожалуйста, выберите заказчика');
      isValid = false;
    } else {
      setClientIdError('');
    }
    
    // Валидация менеджера
    if (!managerId) {
      setManagerIdError('Пожалуйста, выберите менеджера');
      isValid = false;
    } else {
      setManagerIdError('');
    }
    
    return isValid;
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(createProject({
        name,
        address,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status,
        clientId,
        managerId
      }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создание нового проекта
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Название проекта"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!nameError}
                helperText={nameError}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={!!addressError}
                helperText={addressError}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дата начала"
                  value={startDate}
                  onChange={(newValue: Date | null) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!startDateError,
                      helperText: startDateError
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дата окончания"
                  value={endDate}
                  onChange={(newValue: Date | null) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!endDateError,
                      helperText: endDateError
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Статус</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Статус"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value={ProjectStatus.PLANNING}>Планирование</MenuItem>
                  <MenuItem value={ProjectStatus.IN_PROGRESS}>В процессе</MenuItem>
                  <MenuItem value={ProjectStatus.ON_HOLD}>Приостановлен</MenuItem>
                  <MenuItem value={ProjectStatus.COMPLETED}>Завершен</MenuItem>
                  <MenuItem value={ProjectStatus.CANCELLED}>Отменен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!clientIdError} required>
                <InputLabel id="client-label">Заказчик</InputLabel>
                <Select
                  labelId="client-label"
                  value={clientId}
                  label="Заказчик"
                  onChange={(e) => setClientId(e.target.value)}
                >
                  {loadingUsers ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    clients.map((client) => (
                      <MenuItem key={client._id} value={client._id}>
                        {client.name} ({client.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {clientIdError && <FormHelperText>{clientIdError}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!managerIdError} required>
                <InputLabel id="manager-label">Менеджер</InputLabel>
                <Select
                  labelId="manager-label"
                  value={managerId}
                  label="Менеджер"
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  {loadingUsers ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    managers.map((manager) => (
                      <MenuItem key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {managerIdError && <FormHelperText>{managerIdError}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  Создать проект
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProjectPage;