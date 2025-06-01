import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectApi } from '../../utils/api';
import { Project } from '../../types/project';

interface ProjectsState {
  projects: Project[];
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  page: number;
  pages: number;
  total: number;
}

const initialState: ProjectsState = {
  projects: [],
  project: null,
  isLoading: false,
  error: null,
  success: false,
  page: 1,
  pages: 1,
  total: 0
};

// Получение списка проектов
export const getProjects = createAsyncThunk(
  'projects/getProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectApi.getProjects();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при получении проектов');
    }
  }
);

// Получение проекта по ID
export const getProjectById = createAsyncThunk(
  'projects/getProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await projectApi.getProjectById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при получении проекта');
    }
  }
);

// Создание нового проекта
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Partial<Project>, { rejectWithValue }) => {
    try {
      const response = await projectApi.createProject(projectData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при создании проекта');
    }
  }
);

// Обновление проекта
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }: { id: string; projectData: Partial<Project> }, { rejectWithValue }) => {
    try {
      const response = await projectApi.updateProject(id, projectData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении проекта');
    }
  }
);

// Удаление проекта
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении проекта');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    resetProjectSuccess: (state) => {
      state.success = false;
    },
    resetProject: (state) => {
      state.project = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка getProjects
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Обработка getProjectById
      .addCase(getProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.project = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Обработка createProject
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.success = true;
        state.projects.unshift(action.payload);
        state.project = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Обработка updateProject
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.success = true;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Обработка deleteProject
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.success = true;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.project && state.project._id === action.payload) {
          state.project = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearProjectError, resetProjectSuccess, resetProject } = projectSlice.actions;
export default projectSlice.reducer;