<template>
    <div>
        <button
            @click="$router.back()"
            class="mb-6 button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
        >
            ← Kembali
        </button>

        <div v-if="recipeStore.loading" class="py-12 text-center">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="recipeStore.error" class="py-12 text-center">
            <p class="text-error">{{ recipeStore.error }}</p>
        </div>

        <div v-else-if="recipe" class="card">
            <div class="mb-6">
                <div class="flex gap-4 justify-between items-center mb-4">
                    <h1 class="text-4xl font-bold text-textPrimary">{{ recipe.name }}</h1>
                    <span class="category-badges">
                        {{ recipe.category }}
                    </span>
                </div>

                <p v-if="recipe.description" class="mb-6 text-lg text-textPrimary">
                    {{ recipe.description }}
                </p>
            </div>

            <!-- list bahan -->
            <div class="grid gap-8 md:grid-cols-2">
                <div>
                    <h2 class="mb-4 text-2xl font-bold text-textPrimary">Bahan</h2>
                    <div class="p-4 rounded-lg bg-overlay">
                        <ul class="space-y-2">
                            <li v-for="(ingredient, index) in ingredientsList" :key="index" class="flex items-start">
                                <span class="mr-2 text-textPrimary">•</span>
                                <span class="text-textPrimary">
                                    <span v-if="ingredient.quantity" class="font-semibold">
                                        {{ ingredient.quantity }} {{ ingredient.unit }}
                                    </span>
                                    {{ ingredient.name }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h2 class="mb-4 text-2xl font-bold text-textPrimary">Instruksi</h2>
                    <div class="p-4 rounded-lg bg-overlay">
                        <p class="whitespace-pre-line text-textPrimary">{{ recipe.instructions }}</p>
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

onMounted(() => {
    const id = Number(route.params.id);
    recipeStore.fetchRecipeById(id);
});
</script>
