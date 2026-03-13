<template>
    <div class="flex flex-col gap-5 p-4 mx-auto w-full max-w-4xl lg:px-6">
        <button
            @click="$router.back()"
            class="inline-flex gap-1.5 items-center button bg-overlay text-textSecondary w-fit hover:bg-divider hover:text-textPrimary"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
        </button>

        <div v-if="recipeStore.loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="recipeStore.error" class="card">
            <div class="alert-box alert-error">
                <p class="text-sm font-semibold text-error">{{ recipeStore.error }}</p>
            </div>
        </div>

        <div v-else-if="recipe" class="flex flex-col gap-5">
            <div class="card">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row gap-3 justify-between items-start">
                        <h1 class="text-2xl font-bold leading-tight lg:text-4xl text-textPrimary">
                            {{ recipe.name }}
                        </h1>
                        <span class="category-badges shrink-0">
                            {{ recipe.category }}
                        </span>
                    </div>

                    <div
                        class="flex flex-col gap-2 py-3 px-4 rounded-lg sm:flex-row sm:gap-6 sm:items-center bg-background"
                    >
                        <div v-if="recipe.creator_username" class="flex gap-2 items-center text-sm">
                            <span class="font-medium text-textSecondary">Oleh:</span>
                            <span class="font-semibold text-textPrimary">{{ recipe.creator_username }}</span>
                        </div>

                        <div v-if="recipe.created_at" class="flex gap-2 items-center text-sm">
                            <span class="font-medium text-textSecondary">Dibuat:</span>
                            <span class="text-textPrimary">{{ formatDate(recipe.created_at) }}</span>
                        </div>
                    </div>

                    <p v-if="recipe.description" class="text-base leading-relaxed lg:text-lg text-textSecondary">
                        {{ recipe.description }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div class="card">
                    <h2 class="mb-4 text-xl font-bold lg:text-2xl text-textPrimary">Bahan-bahan</h2>
                    <div class="flex flex-col p-4 rounded-lg bg-background">
                        <div v-for="(ingredient, index) in ingredientsList" :key="index" class="flex gap-1 items-start">
                            <span class="text-primary shrink-0">•</span>
                            <span class="text-sm leading-relaxed text-textPrimary">
                                <span v-if="ingredient.quantity" class="font-semibold text-textPrimary">
                                    {{ ingredient.quantity }}{{ ingredient.unit ? ' ' + ingredient.unit : '' }}
                                </span>
                                {{ ingredient.name }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="mb-4 text-xl font-bold lg:text-2xl text-textPrimary">Instruksi</h2>
                    <div class="p-4 rounded-lg bg-background">
                        <p class="text-sm leading-relaxed whitespace-pre-line text-textPrimary">
                            {{ recipe.instructions }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { Recipe, Ingredient } from '@/types';

const route = useRoute();
const recipeStore = useRecipeStore();

const recipe = computed<Recipe | null>(() => recipeStore.currentRecipe);

const ingredientsList = computed<Ingredient[]>(() => {
    if (!recipe.value) return [];

    if (Array.isArray(recipe.value.ingredients)) {
        return recipe.value.ingredients;
    }

    if (typeof recipe.value.ingredients === 'string') {
        return recipe.value.ingredients.split(',').map((i) => ({
            name: i.trim(),
            quantity: null,
            unit: null,
        }));
    }

    return [];
});

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

onMounted(() => {
    const id = Number(route.params.id);
    recipeStore.fetchRecipeById(id);
});
</script>
