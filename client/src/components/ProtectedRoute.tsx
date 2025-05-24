import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Компонент для защиты маршрутов, требующих аутентификации
 * @param allowedRoles - массив разрешенных ролей (если не указан, доступ разрешен всем аутентифицированным пользователям)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Если указаны разрешенные роли и роль пользователя не входит в список, перенаправляем на главную страницу
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Если все проверки пройдены, отображаем дочерние маршруты
  return <Outlet />;
};

export default ProtectedRoute;