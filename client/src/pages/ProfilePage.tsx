import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/store';
import { updateUserProfile } from '../features/auth/authSlice';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);

    // Валидация формы
    if (!name || !email) {
      setFormError('Имя и email обязательны');
      return;
    }

    if (password && password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }

    // Вызываем action для обновления профиля
    const userData = password ? { name, email, password } : { name, email };
    dispatch(updateUserProfile(userData));
    setSuccess(true);
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Alert severity="error">Пользователь не найден</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Профиль пользователя
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Профиль успешно обновлен</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Имя"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Изменить пароль (оставьте пустым, если не хотите менять)
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Новый пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Подтвердите новый пароль"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;