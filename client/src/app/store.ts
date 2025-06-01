import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Импортируем редьюсеры
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
// Остальные редьюсеры будут добавлены позже
// import estimateReducer from '../features/estimates/estimateSlice';
// import scheduleReducer from '../features/schedules/scheduleSlice';
// import statusReducer from '../features/status/statusSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    // estimates: estimateReducer,
    // schedules: scheduleReducer,
    // status: statusReducer,
  },
});

// Типизация для Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Хуки с типизацией
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;