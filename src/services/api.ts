import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
    AdminRecipesResponse,
    AdminStatsResponse,
    AuthResponse,
    CreateRecipeData,
    LoginCredentials,
    MessageResponse,
    ProfileResponse,
    RecipeResponse,
    RegisterData,
    SearchCriteria,
    SearchResponse,
    UserDetailResponse,
    UserListResponse,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL;

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Terjadi kesalahan';
        return Promise.reject({ message, status: error.response?.status });
    }
);

export default {
    auth: {
        register: (data: RegisterData): Promise<AuthResponse> => api.post('/auth/register', data),

        login: (data: LoginCredentials): Promise<AuthResponse> => api.post('/auth/login', data),

        currentUser: (): Promise<UserDetailResponse> => api.get('/auth/me'),
    },

    recipes: {
        showAll: (params?: Record<string, string>): Promise<RecipeResponse> =>
            api.get('/recipes', { params }),

        showMine: (): Promise<RecipeResponse> => api.get('/recipes/my'),

        showRecipe: (id: number): Promise<RecipeResponse> => api.get(`/recipes/${id}`),

        showMyRecipeById: (id: number): Promise<RecipeResponse> => api.get(`/recipes/${id}/edit`),

        create: (data: CreateRecipeData): Promise<RecipeResponse> => api.post('/recipes', data),

        update: (id: number, data: CreateRecipeData): Promise<RecipeResponse> =>
            api.put(`/recipes/${id}`, data),

        delete: (id: number): Promise<MessageResponse> => api.delete(`/recipes/${id}`),
    },

    search: {
        query: (data: SearchCriteria): Promise<SearchResponse> => api.post('/search', data),
    },

    profile: {
        showProfile: (): Promise<ProfileResponse> => api.get('/profile'),

        updateProfile: (username: string): Promise<MessageResponse> =>
            api.put('/profile', { username }),

        updatePassword: (currentPassword: string, newPassword: string): Promise<MessageResponse> =>
            api.put('/profile/password', { currentPassword, newPassword }),
    },

    admin: {
        showAllUsers: (params?: Record<string, string>): Promise<UserListResponse> =>
            api.get('/admin/users', { params }),

        suspendUser: (userId: number): Promise<MessageResponse> =>
            api.put(`/admin/users/${userId}/suspend`),

        unsuspendUser: (userId: number): Promise<MessageResponse> =>
            api.put(`/admin/users/${userId}/unsuspend`),

        deleteUser: (userId: number): Promise<MessageResponse> =>
            api.delete(`/admin/users/${userId}`),

        showRecipe: (id: number): Promise<RecipeResponse> => api.get(`/admin/recipes/${id}`),

        showAllRecipes: (params?: Record<string, string>): Promise<AdminRecipesResponse> =>
            api.get('/admin/recipes', { params }),

        showPendingRecipes: (): Promise<AdminRecipesResponse> => api.get('/admin/recipes/pending'),

        showRecipesByStatus: (
            status: 'pending' | 'approved' | 'rejected'
        ): Promise<AdminRecipesResponse> =>
            api.get('/admin/recipes/status', { params: { status } }),

        approveRecipe: (id: number): Promise<RecipeResponse> =>
            api.put(`/admin/recipes/${id}/approve`),

        rejectRecipe: (id: number, reason?: string): Promise<RecipeResponse> =>
            api.put(`/admin/recipes/${id}/reject`, { reason }),

        deleteRecipe: (id: number): Promise<MessageResponse> => api.delete(`/admin/recipes/${id}`),

        showStats: (): Promise<AdminStatsResponse> => api.get('/admin/stats'),
    },
};
