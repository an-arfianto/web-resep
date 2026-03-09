import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { ModerationRecipe, ModerationStats, RecipeStatus, ApiError } from '@/types';

export const useModerationStore = defineStore('moderation', () => {
    const stats = ref<ModerationStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    const pendingRecipes = ref<ModerationRecipe[]>([]);
    const allRecipes = ref<ModerationRecipe[]>([]);
    const currentRecipe = ref<ModerationRecipe | null>(null);

    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    async function fetchStats(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.moderation.getStats();
            stats.value = response.data;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    async function fetchPendingRecipes(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.moderation.getPending();
            pendingRecipes.value = response.data;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    async function fetchByStatus(status: RecipeStatus): Promise<ModerationRecipe[]> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.moderation.getByStatus(status);
            return response.data;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
            return [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchAllRecipes(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.moderation.getAllRecipes();
            allRecipes.value = response.data;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    async function fetchRecipeById(id: number): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.moderation.getRecipeById(id);
            currentRecipe.value = response.data as ModerationRecipe;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    async function approveRecipe(id: number): Promise<boolean> {
        loading.value = true;
        try {
            await api.moderation.approve(id);

            // update state
            pendingRecipes.value = pendingRecipes.value.filter((r) => r.id !== id);
            if (currentRecipe.value?.id === id) {
                currentRecipe.value.status = 'approved';
            }

            // refresh stats
            await fetchStats();

            return true;
        } catch (err) {
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function rejectRecipe(id: number, reason?: string): Promise<boolean> {
        loading.value = true;
        try {
            await api.moderation.reject(id, reason);

            // update state
            pendingRecipes.value = pendingRecipes.value.filter((r) => r.id !== id);
            if (currentRecipe.value?.id === id) {
                currentRecipe.value.status = 'rejected';
                currentRecipe.value.rejection_reason = reason || null;
            }

            // refresh stats
            await fetchStats();

            return true;
        } catch (err) {
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        stats,
        pendingRecipes,
        allRecipes,
        currentRecipe,
        loading,
        error,
        fetchStats,
        fetchPendingRecipes,
        fetchByStatus,
        fetchAllRecipes,
        fetchRecipeById,
        approveRecipe,
        rejectRecipe,
    };
});
