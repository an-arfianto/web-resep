import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { AdminStats, Recipe, User } from '@/types';

export const useAdminStore = defineStore('admin', () => {
    const stats = ref<AdminStats | null>(null);
    const users = ref<User[]>([]);
    const allRecipes = ref<Recipe[]>([]);
    const pendingRecipes = ref<Recipe[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

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

    async function showStats(): Promise<void> {
        await withLoading(async () => {
            const response = await api.admin.showStats();
            stats.value = response.data;
        });
    }

    async function showAllUsers(): Promise<void> {
        await withLoading(async () => {
            const response = await api.admin.showAllUsers();
            users.value = response.data;
        });
    }

    async function suspendUser(userId: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.suspendUser(userId);
            const target = users.value.find((u) => u.id === userId);
            if (target) target.is_suspended = true;
            return true;
        });
        return result ?? false;
    }

    async function unsuspendUser(userId: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.unsuspendUser(userId);
            const target = users.value.find((u) => u.id === userId);
            if (target) target.is_suspended = false;
            return true;
        });
        return result ?? false;
    }

    async function deleteUser(userId: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.deleteUser(userId);
            users.value = users.value.filter((u) => u.id !== userId);
            return true;
        });
        return result ?? false;
    }

    async function showAllRecipes(): Promise<void> {
        await withLoading(async () => {
            const response = await api.admin.showAllRecipes();
            allRecipes.value = response.data;
        });
    }

    async function showPendingRecipes(): Promise<void> {
        await withLoading(async () => {
            const response = await api.admin.showPendingRecipes();
            pendingRecipes.value = response.data;
        });
    }

    async function approveRecipe(id: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.approveRecipe(id);
            pendingRecipes.value = pendingRecipes.value.filter((r) => r.id !== id);
            const recipe = allRecipes.value.find((r) => r.id === id);
            if (recipe) recipe.status = 'approved';
            return true;
        });
        return result ?? false;
    }

    async function rejectRecipe(id: number, reason?: string): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.rejectRecipe(id, reason);
            pendingRecipes.value = pendingRecipes.value.filter((r) => r.id !== id);
            const recipe = allRecipes.value.find((r) => r.id === id);
            if (recipe) {
                recipe.status = 'rejected';
                recipe.rejection_reason = reason ?? null;
            }
            return true;
        });
        return result ?? false;
    }

    async function deleteRecipe(id: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.admin.deleteRecipe(id);
            allRecipes.value = allRecipes.value.filter((r) => r.id !== id);
            pendingRecipes.value = pendingRecipes.value.filter((r) => r.id !== id);
            return true;
        });
        return result ?? false;
    }

    return {
        stats,
        users,
        allRecipes,
        pendingRecipes,
        loading,
        error,
        showStats,
        showAllUsers,
        suspendUser,
        unsuspendUser,
        deleteUser,
        showAllRecipes,
        showPendingRecipes,
        approveRecipe,
        rejectRecipe,
        deleteRecipe,
    };
});
