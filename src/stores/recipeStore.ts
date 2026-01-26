import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type { Recipe, SearchCriteria, SearchResponse, CreateRecipeData, ApiError } from "@/types";

export const useRecipeStore = defineStore("recipe", () => {
    const recipes = ref<Recipe[]>([]);
    const myRecipes = ref<Recipe[]>([]); // separate state untuk resep owner
    const currentRecipe = ref<Recipe | null>(null);
    const searchResults = ref<Recipe[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    async function fetchAllRecipes(filters: Record<string, any> = {}): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.recipes.getAll(filters);
            recipes.value = Array.isArray(response.data) ? response.data : [response.data];
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    // etch current user's recipes (all statuses)
    async function fetchMyRecipes(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.recipes.getMy();
            myRecipes.value = Array.isArray(response.data) ? response.data : [response.data];
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
            const response = await api.recipes.getById(id);
            currentRecipe.value = response.data as Recipe;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
        } finally {
            loading.value = false;
        }
    }

    async function searchRecipes(searchData: SearchCriteria): Promise<SearchResponse | null> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.recipes.search(searchData);
            searchResults.value = response.data;
            return response;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function createRecipe(recipeData: CreateRecipeData): Promise<any> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.recipes.create(recipeData);
            return response;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateRecipe(id: number, recipeData: CreateRecipeData): Promise<any> {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.recipes.update(id, recipeData);
            return response;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function deleteRecipe(id: number): Promise<boolean> {
        loading.value = true;
        error.value = null;
        try {
            await api.recipes.delete(id);
            // Remove from both arrays
            recipes.value = recipes.value.filter((r) => r.id !== id);
            myRecipes.value = myRecipes.value.filter((r) => r.id !== id);
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            error.value = apiError.message;
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        recipes,
        myRecipes,
        currentRecipe,
        searchResults,
        loading,
        error,
        fetchAllRecipes,
        fetchMyRecipes,
        fetchRecipeById,
        searchRecipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
    };
});
