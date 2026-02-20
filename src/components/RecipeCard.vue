<template>
    <div class="transition-shadow cursor-pointer hover:shadow-lg card" @click="goToDetail">
        <h3 class="mb-2 text-xl font-bold text-textPrimary">{{ recipe.name }}</h3>

        <div class="flex gap-2 items-center mb-3">
            <span class="category-badges">
                {{ recipe.category }}
            </span>
            <span v-if="recipe.matched_count" class="text-success bg-successSoft category-badges">
                {{ recipe.matched_count }} bahan sama
            </span>
        </div>

        <p class="mb-4 text-sm text-textPrimary line-clamp-2">
            {{ recipe.ingredients }}
        </p>

        <button class="w-full button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse">
            Lihat Resep
        </button>
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
