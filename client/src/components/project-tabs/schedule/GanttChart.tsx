import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Gantt, Task, ViewMode } from '@rsagiev/gantt-task-react-19';
import '@rsagiev/gantt-task-react-19/dist/index.css';
import { GanttChartProps } from './types';
import { prepareGanttData, statusColors, ScheduleItemStatus } from './scheduleUtils';

const GanttChart: React.FC<GanttChartProps> = ({ items, onTaskClick }) => {
  // Преобразуем данные для диаграммы Ганта
  const tasks: Task[] = React.useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }
    
    return prepareGanttData(items) as Task[];
  }, [items]);

  // Обработчик клика по задаче
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      // Находим оригинальный элемент по ID
      const originalItem = items.find(item => item._id === task.id);
      if (originalItem) {
        onTaskClick(originalItem);
      }
    }
  };

  // Кастомизация отображения задачи
  const customTaskContent = (task: Task) => {
    const status = items.find(item => item._id === task.id)?.status as ScheduleItemStatus;
    const statusColor = statusColors[status] || '#ccc';
    
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          backgroundColor: statusColor,
          borderRadius: '4px',
          color: '#fff',
          padding: '0 8px'
        }}
      >
        <span>{task.name}</span>
      </div>
    );
  };

  if (!tasks.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Нет данных для отображения</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ 
      height: '500px', 
      '& .gantt-task-react': { 
        fontFamily: 'Roboto, sans-serif',
        fontSize: '14px'
      } 
    }}>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Month}
        onSelect={handleTaskClick}
        listCellWidth="200px"
        columnWidth={60}
        TaskListHeader={() => (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '100%', 
            padding: '0 16px',
            fontWeight: 'bold',
            borderBottom: '1px solid #e0e0e0'
          }}>
            Название работы
          </Box>
        )}
        TaskListTable={(props) => (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            borderRight: '1px solid #e0e0e0'
          }}>
            {props.tasks.map(customTaskContent)}
          </Box>
        )}
        TooltipContent={({ task }) => (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">{task.name}</Typography>
            <Typography variant="body2">
              Начало: {new Date(task.start).toLocaleDateString('ru-RU')}
            </Typography>
            <Typography variant="body2">
              Окончание: {new Date(task.end).toLocaleDateString('ru-RU')}
            </Typography>
            <Typography variant="body2">
              Прогресс: {task.progress}%
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
};

export default GanttChart;