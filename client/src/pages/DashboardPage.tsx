import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { getProjects, clearProjectError } from '../features/projects/projectSlice';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { projects, isLoading, error } = useAppSelector((state) => state.projects);

  // Загрузка проектов при монтировании компонента
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  // Функция для отображения статуса проекта на русском языке
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Планирование';
      case 'in_progress':
        return 'В процессе';
      case 'on_hold':
        return 'Приостановлен';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Дашборд
        </Typography>
        {/* Кнопка добавления проекта только для менеджеров (НеБригадиров) и заказчиков */}
        {user && (user.role === 'manager' || user.role === 'client') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Новый проект
          </Button>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearProjectError())}
        >
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Ваши проекты
          </Typography>
          {projects.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                У вас пока нет проектов.
                {user && (user.role === 'manager' || user.role === 'client') && (
                  <Button
                    variant="text"
                    onClick={() => navigate('/projects/new')}
                    sx={{ ml: 1 }}
                  >
                    Создать новый проект
                  </Button>
                )}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {projects.map((project) => (
                <Box key={project._id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.address}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Статус:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {getStatusText(project.status)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Начало:</Typography>
                        <Typography variant="body2">
                          {formatDate(project.startDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Окончание:</Typography>
                        <Typography variant="body2">
                          {formatDate(project.endDate)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project._id}`)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project._id}/estimate`)}
                      >
                        Смета
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project._id}/schedule`)}
                      >
                        График
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project._id}/status`)}
                      >
                        Статус
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default DashboardPage;