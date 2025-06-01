import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/store';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import { User, Project, ProjectStatus, UserRole } from '../../types/project';
import { projectApi } from '../../utils/api';

interface ProjectInfoTabProps {
  project: Project;
}

const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({ project }) => {
  const { user } = useAppSelector((state) => state.auth) as { user: User | null };
  const [loading, setLoading] = useState(false);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Загрузка списка участников проекта
  useEffect(() => {
    const fetchProjectUsers = async () => {
      try {
        setLoading(true);
        const users = await projectApi.getProjectUsers(project._id);
        setProjectUsers(users);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project users:', err);
        setError('Ошибка при загрузке участников проекта');
        setLoading(false);
      }
    };

    fetchProjectUsers();
  }, [project._id]);

  // Функция для отображения роли пользователя на русском языке
  const getRoleText = (role: string) => {
    switch (role) {
      case UserRole.CLIENT:
        return 'Заказчик';
      case UserRole.MANAGER:
        return 'НеБригадир';
      case UserRole.EXPERT:
        return 'Эксперт-приёмщик';
      case UserRole.COORDINATOR:
        return 'Координатор';
      case UserRole.MASTER:
        return 'Мастер';
      case UserRole.DESIGNER:
        return 'Дизайнер';
      default:
        return 'Неизвестно';
    }
  };

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

  // Обработчик изменения полей проекта
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProject({
      ...editedProject,
      [name]: value
    });
  };

  // Обработчик сохранения изменений проекта
  const handleSaveProject = async () => {
    try {
      // Валидация формы
      const errors: {[key: string]: string} = {};
      
      if (!editedProject.name.trim()) {
        errors.name = 'Название проекта обязательно';
      }
      
      if (!editedProject.address.trim()) {
        errors.address = 'Адрес обязателен';
      }
      
      if (!editedProject.startDate) {
        errors.startDate = 'Дата начала обязательна';
      }
      
      if (!editedProject.endDate) {
        errors.endDate = 'Дата окончания обязательна';
      }
      
      if (new Date(editedProject.endDate) < new Date(editedProject.startDate)) {
        errors.endDate = 'Дата окончания должна быть позже даты начала';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      setLoading(true);
      await projectApi.updateProject(project._id, editedProject);
      
      // Закрываем диалог
      setEditDialogOpen(false);
      setSuccess('Проект успешно обновлен');
      
      // Обновляем данные проекта на странице
      window.location.reload();
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Ошибка при обновлении проекта');
      setLoading(false);
    }
  };

  // Обработчик поиска пользователей
  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      const results = await projectApi.searchUsers(searchTerm);
      setSearchResults(results);
      setSearchLoading(false);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Ошибка при поиске пользователей');
      setSearchLoading(false);
    }
  };

  // Обработчик добавления пользователя в проект
  const handleAddUser = async () => {
    try {
      // Валидация формы
      const errors: {[key: string]: string} = {};
      
      if (!selectedUser) {
        errors.user = 'Выберите пользователя';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      setLoading(true);
      await projectApi.addProjectUser(project._id, {
        userId: selectedUser,
        role: selectedRole
      });
      
      // Закрываем диалог и сбрасываем форму
      setAddUserDialogOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      setSearchTerm('');
      setSearchResults([]);
      setSuccess('Пользователь успешно добавлен в проект');
      
      // Обновляем список пользователей
      const users = await projectApi.getProjectUsers(project._id);
      setProjectUsers(users);
      setLoading(false);
    } catch (err) {
      console.error('Error adding user to project:', err);
      setError('Ошибка при добавлении пользователя в проект');
      setLoading(false);
    }
  };

  // Проверка прав доступа для редактирования проекта
  const canEditProject = user && (user.role === UserRole.MANAGER || (user.role === UserRole.CLIENT && user._id === project.clientId));

  return (
    <Box>
      {/* Основная информация о проекте */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Основная информация</Typography>
          {canEditProject && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
            >
              Редактировать
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Название проекта
              </Typography>
              <Typography variant="body1" gutterBottom>
                {project.name}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Адрес
              </Typography>
              <Typography variant="body1" gutterBottom>
                {project.address}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Статус
              </Typography>
              <Typography variant="body1" gutterBottom>
                {getStatusText(project.status)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Дата начала
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(project.startDate)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Дата окончания
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(project.endDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Участники проекта */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Участники проекта</Typography>
          {user && user.role === UserRole.MANAGER && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddUserDialogOpen(true)}
            >
              Добавить участника
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {projectUsers.map((projectUser) => (
              <ListItem key={projectUser._id} divider>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={projectUser.name}
                  secondary={projectUser.email}
                />
                <Chip
                  label={getRoleText(projectUser.role)}
                  color={projectUser.role === UserRole.MANAGER ? 'primary' : 'default'}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Диалог редактирования проекта */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактирование проекта</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Название проекта"
              name="name"
              value={editedProject.name}
              onChange={handleProjectChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              fullWidth
              label="Адрес"
              name="address"
              value={editedProject.address}
              onChange={handleProjectChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Дата начала"
                name="startDate"
                type="date"
                value={editedProject.startDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                required
              />
              
              <TextField
                sx={{ flex: 1 }}
                label="Дата окончания"
                name="endDate"
                type="date"
                value={editedProject.endDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                required
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Статус проекта</InputLabel>
              <Select
                labelId="status-select-label"
                name="status"
                value={editedProject.status}
                onChange={(e) => handleProjectChange({
                  target: { name: 'status', value: e.target.value }
                } as React.ChangeEvent<HTMLInputElement>)}
                label="Статус проекта"
              >
                <MenuItem value={ProjectStatus.PLANNING}>Планирование</MenuItem>
                <MenuItem value={ProjectStatus.IN_PROGRESS}>В процессе</MenuItem>
                <MenuItem value={ProjectStatus.ON_HOLD}>Приостановлен</MenuItem>
                <MenuItem value={ProjectStatus.COMPLETED}>Завершен</MenuItem>
                <MenuItem value={ProjectStatus.CANCELLED}>Отменен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления участника */}
      <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавление участника в проект</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Поиск пользователя"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Введите имя или email пользователя"
              />
              <Button
                variant="contained"
                onClick={handleSearchUsers}
                disabled={searchLoading}
              >
                {searchLoading ? <CircularProgress size={24} /> : 'Поиск'}
              </Button>
            </Box>
            
            {searchResults.length > 0 && (
              <FormControl fullWidth error={!!formErrors.user}>
                <InputLabel id="user-select-label">Выберите пользователя</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Выберите пользователя"
                >
                  {searchResults.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {getRoleText(user.role)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.user && <FormHelperText>{formErrors.user}</FormHelperText>}
              </FormControl>
            )}
            
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Роль в проекте</InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Роль в проекте"
              >
                <MenuItem value={UserRole.CLIENT}>Заказчик</MenuItem>
                <MenuItem value={UserRole.MANAGER}>НеБригадир</MenuItem>
                <MenuItem value={UserRole.EXPERT}>Эксперт-приёмщик</MenuItem>
                <MenuItem value={UserRole.COORDINATOR}>Координатор</MenuItem>
                <MenuItem value={UserRole.MASTER}>Мастер</MenuItem>
                <MenuItem value={UserRole.DESIGNER}>Дизайнер</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectInfoTab;