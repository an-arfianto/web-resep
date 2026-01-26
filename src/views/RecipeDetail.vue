<template>
    <div>
        <button @click="$router.back()" class="mb-6 btn-secondary">← Kembali</button>

        <div v-if="recipeStore.loading" class="py-12 text-center">
            <div
                class="inline-block w-12 h-12 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"
            ></div>
        </div>

        <div v-else-if="recipeStore.error" class="py-12 text-center">
            <p class="text-red-600">{{ recipeStore.error }}</p>
        </div>

        <div v-else-if="recipe" class="card">
            <div class="mb-6">
                <div
                    class="flex justify-center items-center mb-6 w-full h-64 bg-gradient-to-br rounded-xl from-primary-400 to-primary-600"
                >
                    <span class="text-9xl">🍽️</span>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-4xl font-bold text-gray-900">{{ recipe.name }}</h1>
                    <span
                        class="py-2 px-4 font-medium rounded-full bg-primary-100 text-primary-700"
                    >
                        {{ recipe.category }}
                    </span>
                </div>

                <p v-if="recipe.description" class="mb-6 text-lg text-gray-600">
                    {{ recipe.description }}
                </p>
            </div>

            <!-- list bahan -->
            <div class="grid gap-8 md:grid-cols-2">
                <div>
                    <h2 class="mb-4 text-2xl font-bold text-gray-900">Bahan</h2>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <ul class="space-y-2">
                            <li
                                v-for="(ingredient, index) in ingredientsList"
                                :key="index"
                                class="flex items-start"
                            >
                                <span class="mr-2 text-primary-600">•</span>
                                <span class="text-gray-700">
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
                    <h2 class="mb-4 text-2xl font-bold text-gray-900">Instruksi</h2>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-gray-700 whitespace-pre-line">{{ recipe.instructions }}</p>
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
