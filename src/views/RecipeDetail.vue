<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { Recipe, Ingredient } from '@/types';
import { formatDate } from '@/utils/recipeUtils';

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

onMounted(() => {
    const id = Number(route.params.id);
    recipeStore.showRecipe(id);
});
</script>

<template>
    <div class="container-body">
        <button
            @click="$router.back()"
            class="inline-flex gap-1.5 items-center button bg-overlay text-textSecondary w-fit hover:bg-divider hover:text-textPrimary"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="15"
                height="15"
            >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
        </button>

        <div v-if="recipeStore.loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="recipeStore.error" class="card">
            <div class="alert-box">
                <p class="alert-text">{{ recipeStore.error }}</p>
            </div>
        </div>

        <div v-else-if="recipe" class="flex flex-col gap-5">
            <div class="card">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row gap-3 justify-between items-start">
                        <h1 class="mb-0 card-title">
                            {{ recipe.name }}
                        </h1>
                        <span class="category-badges shrink-0">
                            {{ recipe.category }}
                        </span>
                    </div>

                    <div
                        class="flex flex-col sm:flex-row sm:gap-6 sm:items-center card bg-background"
                    >
                        <div v-if="recipe.creator_username" class="flex gap-2 items-center text-sm">
                            <span class="font-medium text-textSecondary">Oleh:</span>
                            <span class="font-semibold text-textPrimary">{{
                                recipe.creator_username
                            }}</span>
                        </div>

                        <div v-if="recipe.created_at" class="flex gap-2 items-center text-sm">
                            <span class="font-medium text-textSecondary">Dibuat:</span>
                            <span class="text-textPrimary">{{
                                formatDate(recipe.created_at)
                            }}</span>
                        </div>
                    </div>

                    <p v-if="recipe.description" class="text-base card-subtitle">
                        {{ recipe.description }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div class="card">
                    <p class="mb-2 card-title">Bahan-bahan</p>
                    <div class="flex flex-col card bg-background">
                        <div
                            v-for="(ingredient, index) in ingredientsList"
                            :key="index"
                            class="flex gap-1 items-start"
                        >
                            <span class="text-primary shrink-0">•</span>
                            <span class="card-subtitle text-textPrimary">
                                <span
                                    v-if="ingredient.quantity"
                                    class="font-semibold text-textPrimary"
                                >
                                    {{ ingredient.quantity
                                    }}{{ ingredient.unit ? ' ' + ingredient.unit : '' }}
                                </span>
                                {{ ingredient.name }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <p class="mb-2 card-title">Instruksi</p>
                    <div class="card bg-background">
                        <p class="whitespace-pre-line card-subtitle text-textPrimary">
                            {{ recipe.instructions }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
