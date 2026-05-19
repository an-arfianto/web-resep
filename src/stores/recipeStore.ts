import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type {
    Recipe,
    SearchCriteria,
    SearchResponse,
    CreateRecipeData,
    RecipeResponse,
} from '@/types';

export const useRecipeStore = defineStore('recipe', () => {
    const recipes = ref<Recipe[]>([]);
    const myRecipes = ref<Recipe[]>([]);
    const currentRecipe = ref<Recipe | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    function extractErrorMessage(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const axiosErr = err as any;
            if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
            if (axiosErr.message) return axiosErr.message;
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

    async function showAllRecipes(filters: Record<string, string> = {}): Promise<void> {
        await withLoading(async () => {
            const response = await api.recipes.showAll(filters);
            recipes.value = Array.isArray(response.data) ? response.data : [response.data];
        });
    }

    async function showMyRecipes(): Promise<void> {
        await withLoading(async () => {
            const response = await api.recipes.showMine();
            myRecipes.value = Array.isArray(response.data) ? response.data : [response.data];
        });
    }

    async function showRecipe(id: number): Promise<void> {
        await withLoading(async () => {
            const response = await api.recipes.showRecipe(id);
            currentRecipe.value = response.data as Recipe;
        });
    }

    async function showMyRecipe(id: number): Promise<void> {
        await withLoading(async () => {
            const response = await api.recipes.showMyRecipeById(id);
            currentRecipe.value = response.data as Recipe;
        });
    }

    async function searchRecipes(searchData: SearchCriteria): Promise<SearchResponse | null> {
        return withLoading(async () => {
            const response = await api.search.query(searchData);
            return response;
        });
    }

    async function createRecipe(recipeData: CreateRecipeData): Promise<RecipeResponse | null> {
        return withLoading(() => api.recipes.create(recipeData));
    }

    async function updateRecipe(
        id: number,
        recipeData: CreateRecipeData
    ): Promise<RecipeResponse | null> {
        return withLoading(() => api.recipes.update(id, recipeData));
    }

    async function deleteRecipe(id: number): Promise<boolean> {
        const result = await withLoading(async () => {
            await api.recipes.delete(id);
            return true;
        });

        if (result) {
            recipes.value = recipes.value.filter((r) => r.id !== id);
            myRecipes.value = myRecipes.value.filter((r) => r.id !== id);
            if (currentRecipe.value?.id === id) {
                currentRecipe.value = null;
            }
        }

        return result ?? false;
    }

    return {
        recipes,
        myRecipes,
        currentRecipe,
        loading,
        error,
        showAllRecipes,
        showMyRecipes,
        showRecipe,
        showMyRecipe,
        searchRecipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
    };
});
