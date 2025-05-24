import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/store';
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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Временные данные для демонстрации
const mockProjects = [
  {
    id: '1',
    name: 'Ремонт квартиры на ул. Шейнкмана',
    address: 'ул. Шейнкмана 4, 93',
    status: 'in_progress',
    startDate: '2025-04-10',
    endDate: '2025-05-30'
  },
  {
    id: '2',
    name: 'Ремонт ванной комнаты',
    address: 'ул. Ленина 25, 12',
    status: 'planning',
    startDate: '2025-06-01',
    endDate: '2025-06-15'
  }
];

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState(mockProjects);
  
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // В реальном приложении здесь будет запрос к API для получения проектов
  useEffect(() => {
    // Имитация загрузки данных
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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

      {loading ? (
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
                <Box key={project.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
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
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project.id}/estimate`)}
                      >
                        Смета
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project.id}/schedule`)}
                      >
                        График
                      </Button>
                      <Button
                        size="small"
                        onClick={() => navigate(`/projects/${project.id}/status`)}
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