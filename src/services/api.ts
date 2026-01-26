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
} from '@/types';

const api: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
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

// Response interceptor
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

        getCurrentUser: (): Promise<{ success: boolean; message: string; data: any }> =>
            api.get('/users/me'),
    },

    recipes: {
        getAll: (params?: Record<string, any>): Promise<RecipeResponse> =>
            api.get('/recipes', { params }),

        getMy: (): Promise<RecipeResponse> => api.get('/recipes/my'),

        getById: (id: number): Promise<RecipeResponse> => api.get(`/recipes/${id}`),

        search: (data: SearchCriteria): Promise<SearchResponse> => api.post('/search', data),

        create: (data: CreateRecipeData): Promise<RecipeResponse> => api.post('/recipes', data),

        update: (id: number, data: CreateRecipeData): Promise<RecipeResponse> =>
            api.put(`/recipes/${id}`, data),

        delete: (id: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/recipes/${id}`),
    },

    moderation: {
        // Get moderation statistics
        getStats: (): Promise<ModerationStatsResponse> => api.get('/moderation/stats'),

        // Get pending recipes
        getPending: (): Promise<ModerationRecipesResponse> => api.get('/moderation/pending'),

        // Get recipes by status
        getByStatus: (
            status: 'pending' | 'approved' | 'rejected'
        ): Promise<ModerationRecipesResponse> =>
            api.get('/moderation/recipes', { params: { status } }),

        // Get all recipes (all statuses)
        getAllRecipes: (): Promise<ModerationRecipesResponse> => api.get('/moderation/recipes/all'),

        // Get specific recipe for moderation
        getRecipeById: (id: number): Promise<RecipeResponse> =>
            api.get(`/moderation/recipes/${id}`),

        // Approve recipe
        approve: (id: number): Promise<RecipeResponse> =>
            api.put(`/moderation/recipes/${id}/approve`),

        // Reject recipe
        reject: (id: number, reason?: string): Promise<RecipeResponse> =>
            api.put(`/moderation/recipes/${id}/reject`, { reason }),
    },

    profile: {
        // Get profile with stats
        getProfile: (): Promise<{ success: boolean; data: any }> => api.get('/profile'),

        // Update username
        updateProfile: (
            username: string
        ): Promise<{ success: boolean; message: string; data: any }> =>
            api.put('/profile', { username }),

        // Change password
        updatePassword: (
            currentPassword: string,
            newPassword: string
        ): Promise<{ success: boolean; message: string }> =>
            api.put('/profile/password', { currentPassword, newPassword }),
    },

    admin: {
        // Promote user to moderator
        promoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/promote`),

        // Demote moderator to user
        demoteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.put(`/admin/users/${userId}/demote`),

        // Delete user
        deleteUser: (userId: number): Promise<{ success: boolean; message: string }> =>
            api.delete(`/admin/users/${userId}`),
    },
};
