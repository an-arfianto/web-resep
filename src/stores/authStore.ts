import api from '@/services/api';
import type { LoginCredentials, RegisterData, User } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(localStorage.getItem('token'));
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.role_id === 1);
    const isSuspended = computed(() => !!user.value?.is_suspended);

    function extractErrorMessage(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as any;
            if (e.response?.data?.message) return e.response.data.message;
            if (e.message) return e.message;
        }
        return 'Terjadi kesalahan';
    }

    async function withLoading<T>(fn: () => Promise<T>): Promise<T | null> {
        loading.value = true;
        error.value = null;
        try {
            return await fn();
        } catch (err) {
            error.value = extractErrorMessage(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function register(userData: RegisterData): Promise<boolean> {
        const result = await withLoading(async () => {
            const response = await api.auth.register(userData);
            token.value = response.data.token;
            user.value = response.data.user;
            localStorage.setItem('token', response.data.token);
            return true;
        });
        return result ?? false;
    }

    async function login(credentials: LoginCredentials): Promise<boolean> {
        const result = await withLoading(async () => {
            const response = await api.auth.login(credentials);
            token.value = response.data.token;
            user.value = response.data.user;
            localStorage.setItem('token', response.data.token);
            return true;
        });
        return result ?? false;
    }

    async function checkAuth(): Promise<void> {
        if (!token.value) return;
        try {
            const response = await api.auth.currentUser();
            user.value = response.data as User;

            if (user.value?.is_suspended) {
                logout();
            }
        } catch {
            logout();
        }
    }

    function logout(): void {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSuspended,
        register,
        login,
        checkAuth,
        logout,
    };
});
