import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Компоненты
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Страницы
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateProjectPage from './pages/CreateProjectPage';

// Создаем тему
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Защищенные маршруты для проектов */}
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            </Route>

            {/* Маршруты только для менеджеров (НеБригадиров) */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              {/* <Route path="/users" element={<UsersPage />} /> */}
            </Route>

            {/* Перенаправление для несуществующих маршрутов */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
