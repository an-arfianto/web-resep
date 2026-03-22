import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
    AuthResponse,
    RecipeResponse,
    SearchResponse,
    LoginCredentials,
    RegisterData,
    SearchCriteria,
    CreateRecipeData,
    ModerationStatsResponse,
    ModerationRecipesResponse,
    UserResponse,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL;

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Terjadi kesalahan';
        return Promise.reject({ message, status: error.response?.status });
    }
);

export default {
    auth: {
        register: (data: RegisterData): Promise<AuthResponse> => api.post('/users/register', data),
        login: (data: LoginCredentials): Promise<AuthResponse> => api.post('/users/login', data),
        getCurrentUser: (): Promise<{ success: boolean; message: string; data: any }> => api.get('/users/me'),
    },

    recipes: {
        getAll: (params?: Record<string, any>): Promise<RecipeResponse> => api.get('/recipes', { params }),
        getMy: (): Promise<RecipeResponse> => api.get('/recipes/my'),
        getById: (id: number): Promise<RecipeResponse> => api.get(`/recipes/${id}`),
        search: (data: SearchCriteria): Promise<SearchResponse> => api.post('/search', data),
        create: (data: CreateRecipeData): Promise<RecipeResponse> => api.post('/recipes', data),
        update: (id: number, data: CreateRecipeData): Promise<RecipeResponse> => api.put(`/recipes/${id}`, data),
        delete: (id: number): Promise<{ success: boolean; message: string }> => api.delete(`/recipes/${id}`),
    },

    moderation: {
        getStats: (): Promise<ModerationStatsResponse> => api.get('/moderation/stats'),
        getPending: (): Promise<ModerationRecipesResponse> => api.get('/moderation/pending'),
        getByStatus: (status: 'pending' | 'approved' | 'rejected'): Promise<ModerationRecipesResponse> =>
            api.get('/moderation/recipes', { params: { status } }),
        getAllRecipes: (): Promise<ModerationRecipesResponse> => api.get('/moderation/recipes/all'),
        getRecipeById: (id: number): Promise<RecipeResponse> => api.get(`/moderation/recipes/${id}`),
        approve: (id: number): Promise<RecipeResponse> => api.put(`/moderation/recipes/${id}/approve`),
        reject: (id: number, reason?: string): Promise<RecipeResponse> =>
            api.put(`/moderation/recipes/${id}/reject`, { reason }),
    },

    profile: {
        getProfile: (): Promise<{ success: boolean; data: any }> => api.get('/profile'),
        updateProfile: (username: string): Promise<{ success: boolean; message: string; data: any }> =>
            api.put('/profile', { username }),
        updatePassword: (
            currentPassword: string,
            newPassword: string
        ): Promise<{ success: boolean; message: string }> =>
            api.put('/profile/password', { currentPassword, newPassword }),
    },

    admin: {
        getAllUsers: (params?: Record<string, any>): Promise<UserResponse> => api.get('/admin/users', { params }),
        getAllRecipes: (params?: Record<string, any>): Promise<RecipeResponse> => api.get('/admin/recipes', { params }),
        getStats: (params?: Record<string, any>): Promise<RecipeResponse> => api.get('/admin/stats', { params }),
        promoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/promote`),
        demoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/demote`),
        deleteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/admin/users/${userId}`),
        deleteRecipe: (id: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/admin/recipes/${id}`),
    },
};
