# Задача 4: Настройка React приложения и реализация компонентов аутентификации

## Описание задачи
Необходимо настроить базовое React приложение для сервиса управления ремонтом квартир и реализовать компоненты аутентификации, включая формы регистрации и входа, а также управление токенами и защищенные маршруты.

## Требования

### 1. Настройка React приложения

#### Базовая настройка приложения
- Настроить проект с использованием Create React App
- Настроить маршрутизацию с помощью React Router
- Настроить управление состоянием с помощью Context API
- Настроить Material-UI для компонентов UI
- Настроить Axios для HTTP запросов
- Настроить PWA функциональность

#### Структура проекта
- Организовать структуру проекта согласно лучшим практикам
- Создать папки для компонентов, контекстов, хуков, страниц, сервисов и утилит
- Настроить базовые компоненты макета (Layout, Header, Footer)

#### Настройка маршрутизации
- Настроить маршрутизацию с помощью React Router
- Создать компонент для защищенных маршрутов
- Настроить редиректы и обработку 404 ошибок

### 2. Реализация компонентов аутентификации

#### Контекст аутентификации
- Создать контекст для управления состоянием аутентификации
- Реализовать провайдер контекста с методами для регистрации, входа и выхода
- Реализовать хук для использования контекста аутентификации

#### Сервис для работы с API
- Создать сервис для работы с API аутентификации
- Реализовать методы для регистрации и входа пользователей
- Реализовать методы для получения и обновления данных пользователя

#### Управление токенами
- Реализовать сервис для работы с JWT токенами
- Настроить сохранение токена в localStorage
- Настроить автоматическое добавление токена в заголовки запросов
- Реализовать обработку истечения срока действия токена

#### Компоненты форм аутентификации
- Создать компонент формы регистрации
- Создать компонент формы входа
- Реализовать валидацию форм
- Реализовать обработку ошибок аутентификации

#### Защищенные маршруты
- Создать компонент для защиты маршрутов
- Реализовать проверку аутентификации
- Реализовать редирект на страницу входа при отсутствии аутентификации
- Реализовать проверку ролей для доступа к определенным маршрутам

## Технические детали

### Структура файлов и папок

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.js
│   │   │   ├── RegisterForm.js
│   │   │   └── ProtectedRoute.js
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Alert.js
│   │   │   └── Loader.js
│   │   └── layout/
│   │       ├── Header.js
│   │       ├── Footer.js
│   │       ├── Sidebar.js
│   │       └── Layout.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useForm.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── DashboardPage.js
│   │   ├── ProfilePage.js
│   │   └── NotFoundPage.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── tokenService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.js
│   ├── index.js
│   └── serviceWorker.js
### Содержимое файлов

#### src/index.js
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import App from './App';
import theme from './assets/styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
```

#### src/App.js
```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
```

#### src/contexts/AuthContext.js
```jsx
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenService.getToken();
        if (token) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        tokenService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const { user, token } = await authService.register(userData);
      tokenService.setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const { user, token } = await authService.login(credentials);
      tokenService.setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    tokenService.removeToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    try {
      setError(null);
      const updatedUser = await authService.updateUser(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.error || 'Update failed');
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### src/hooks/useAuth.js
```jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### src/hooks/useForm.js
```jsx
import { useState } from 'react';

export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Mark all fields as touched
      const touchedFields = {};
      Object.keys(values).forEach(key => {
        touchedFields[key] = true;
      });
      setTouched(touchedFields);
      
      // If no errors, call the callback
      if (Object.keys(validationErrors).length === 0) {
        callback(values);
      }
    } else {
      callback(values);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
};
```
#### src/services/api.js
```jsx
import axios from 'axios';
import tokenService from './tokenService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      tokenService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### src/services/authService.js
```jsx
import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateUser: async (userData) => {
    const response = await api.put(`/users/${userData.id}`, userData);
    return response.data.user;
  }
};

export default authService;
```

#### src/services/tokenService.js
```jsx
const TOKEN_KEY = 'auth_token';

const tokenService = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isTokenValid: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }

    try {
      // JWT tokens are in format: header.payload.signature
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return decodedPayload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
};

export default tokenService;
```

#### src/components/auth/LoginForm.js
```jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Link, 
  Box, 
  CircularProgress,
  Alert
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validateLogin } from '../../utils/validators';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    handleSubmit 
  } = useForm(
    { email: '', password: '' },
    validateLogin
  );

  const onSubmit = async (formValues) => {
    try {
      setIsSubmitting(true);
      await login(formValues);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && Boolean(errors.email)}
        helperText={touched.email && errors.email}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && Boolean(errors.password)}
        helperText={touched.password && errors.password}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" variant="body2">
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
```
#### src/components/auth/RegisterForm.js
```jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Link, 
  Box, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validateRegister } from '../../utils/validators';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    handleSubmit 
  } = useForm(
    { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      phone: '',
      role: 'customer'
    },
    validateRegister
  );

  const onSubmit = async (formValues) => {
    try {
      setIsSubmitting(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formValues;
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name && Boolean(errors.name)}
        helperText={touched.name && errors.name}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && Boolean(errors.email)}
        helperText={touched.email && errors.email}
      />
      
      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        autoComplete="tel"
        value={values.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phone && Boolean(errors.phone)}
        helperText={touched.phone && errors.phone}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="not_brigadier">Not Brigadier</MenuItem>
          <MenuItem value="expert">Expert</MenuItem>
          <MenuItem value="coordinator">Coordinator</MenuItem>
          <MenuItem value="master">Master</MenuItem>
          <MenuItem value="designer">Designer</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password && Boolean(errors.password)}
        helperText={touched.password && errors.password}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
        helperText={touched.confirmPassword && errors.confirmPassword}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" variant="body2">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
```

#### src/components/auth/ProtectedRoute.js
```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
    // User doesn't have required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
```

#### src/utils/validators.js
```jsx
export const validateLogin = (values) => {
  const errors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email address is invalid';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

export const validateRegister = (values) => {
  const errors = {};
  
  if (!values.name) {
    errors.name = 'Name is required';
  }
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email address is invalid';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (values.phone && !/^\+?[0-9]{10,15}$/.test(values.phone)) {
    errors.phone = 'Phone number is invalid';
  }
  
  return errors;
};
```

#### src/pages/LoginPage.js
```jsx
import React from 'react';
import { Container, Typography, Paper, Box } from '@material-ui/core';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Sign In
          </Typography>
          <LoginForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
```

#### src/pages/RegisterPage.js
```jsx
import React from 'react';
import { Container, Typography, Paper, Box } from '@material-ui/core';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <RegisterForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
```

#### src/components/layout/Layout.js
```jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@material-ui/core';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
```

#### src/components/layout/Header.js
```jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Brigada Renovation Service
        </Typography>
        
        {isAuthenticated ? (
          <Box>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {currentUser.avatar ? (
                <Avatar src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>Dashboard</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
```

#### src/components/layout/Footer.js
```jsx
import React from 'react';
import { Box, Typography, Link } from '@material-ui/core';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {'© '}
        <Link color="inherit" href="/">
          Brigada Renovation Service
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
```

## Ожидаемый результат

1. Настроенное React приложение с маршрутизацией, управлением состоянием и базовыми компонентами UI
2. Реализованная система аутентификации с использованием Context API
3. Реализованные компоненты форм регистрации и входа
4. Реализованный компонент для защищенных маршрутов
5. Реализованные сервисы для работы с API и токенами

## Критерии приемки

1. Приложение успешно запускается и отображает базовые страницы
2. Система аутентификации работает корректно (регистрация, вход, выход)
3. Защищенные маршруты доступны только аутентифицированным пользователям
4. Формы регистрации и входа работают корректно и выполняют валидацию данных
5. Токены сохраняются в localStorage и автоматически добавляются в заголовки запросов
6. Код соответствует стандартам и лучшим практикам
#### src/components/layout/Footer.js
```jsx
import React from 'react';
import { Box, Typography, Link } from '@material-ui/core';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {'© '}
        <Link color="inherit" href="/">
          Brigada Renovation Service
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
```

## Ожидаемый результат

1. Настроенное React приложение с маршрутизацией, управлением состоянием и базовыми компонентами UI
2. Реализованная система аутентификации с использованием Context API
3. Реализованные компоненты форм регистрации и входа
4. Реализованный компонент для защищенных маршрутов
5. Реализованные сервисы для работы с API и токенами

## Критерии приемки

1. Приложение успешно запускается и отображает базовые страницы
2. Система аутентификации работает корректно (регистрация, вход, выход)
3. Защищенные маршруты доступны только аутентифицированным пользователям
4. Формы регистрации и входа работают корректно и выполняют валидацию данных
5. Токены сохраняются в localStorage и автоматически добавляются в заголовки запросов
6. Код соответствует стандартам и лучшим практикам