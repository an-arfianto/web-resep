<template>
    <div class="transition-shadow cursor-pointer hover:shadow-lg card" @click="goToDetail">
        <div class="mb-4">
            <div
                class="flex justify-center items-center w-full h-48 bg-gradient-to-br rounded-lg from-primary-400 to-primary-600"
            >
                <span class="text-6xl">🍽️</span>
            </div>
        </div>

        <h3 class="mb-2 text-xl font-bold text-gray-900">{{ recipe.name }}</h3>

        <div class="flex gap-2 items-center mb-3">
            <span
                class="py-1 px-3 text-sm font-medium rounded-full bg-primary-100 text-primary-700"
            >
                {{ recipe.category }}
            </span>
            <span
                v-if="recipe.matched_count"
                class="py-1 px-3 text-sm font-medium text-green-700 bg-green-100 rounded-full"
            >
                {{ recipe.matched_count }} bahan sama
            </span>
        </div>

        <p class="mb-4 text-sm text-gray-600 line-clamp-2">
            {{ recipe.ingredients }}
        </p>

        <button class="w-full btn-primary">Lihat Resep</button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Recipe } from '@/types';

interface Props {
    recipe: Recipe;
}

const props = defineProps<Props>();
const router = useRouter();

function goToDetail(): void {
    router.push(`/recipe/${props.recipe.id}`);
}
</script>
