import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Импорт компонентов вкладок
import ProjectInfoTab from '../components/project-tabs/ProjectInfoTab';
import EstimateTab from '../components/project-tabs/EstimateTab';
import ScheduleTab from '../components/project-tabs/ScheduleTab';
import StatusTab from '../components/project-tabs/StatusTab';

// Импорт типов
import { Project, ProjectStatus } from '../types/project';

// Компонент для отображения содержимого вкладки
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Вспомогательная функция для доступности
const a11yProps = (index: number) => {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
};

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Функция для обработки изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Загрузка данных проекта
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь будет запрос к API
        // const response = await axios.get(`/api/projects/${id}`);
        // setProject(response.data);
        // setLoading(false);
        
        // Временные данные для демонстрации
        setTimeout(() => {
          const mockProject = {
            _id: id || '1',
            name: 'Ремонт квартиры на ул. Шейнкмана',
            address: 'ул. Шейнкмана 4, 93',
            status: 'in_progress',
            startDate: '2025-04-10',
            endDate: '2025-05-30',
            clientId: '123',
            managerId: '456'
          };
          setProject(mockProject);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Ошибка при загрузке данных проекта');
        setLoading(false);
        console.error('Error fetching project:', err);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Функция для отображения статуса проекта на русском языке
  const getStatusText = (status: string) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'Планирование';
      case ProjectStatus.IN_PROGRESS:
        return 'В процессе';
      case ProjectStatus.ON_HOLD:
        return 'Приостановлен';
      case ProjectStatus.COMPLETED:
        return 'Завершен';
      case ProjectStatus.CANCELLED:
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


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Проект не найден'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Вернуться на дашборд
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Назад к списку проектов
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {project.address}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Статус
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {getStatusText(project.status)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Дата начала
              </Typography>
              <Typography variant="body1">
                {formatDate(project.startDate)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Дата окончания
              </Typography>
              <Typography variant="body1">
                {formatDate(project.endDate)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="project tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Информация" {...a11yProps(0)} />
            <Tab label="Смета" {...a11yProps(1)} />
            <Tab label="График работ" {...a11yProps(2)} />
            <Tab label="Статусы" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ProjectInfoTab project={project} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <EstimateTab project={project} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ScheduleTab project={project} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <StatusTab project={project} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProjectDetailsPage;