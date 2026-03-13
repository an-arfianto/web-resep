<template>
    <div class="card-interactive" @click="goToDetail">
        <div class="flex gap-2 justify-between items-start mb-1">
            <h3 class="flex-1 text-lg font-bold leading-snug text-textPrimary line-clamp-2">
                {{ recipe.name }}
            </h3>
            <span class="category-badges shrink-0">
                {{ recipe.category }}
            </span>
        </div>

        <div class="flex flex-wrap gap-2 items-center mb-1">
            <span v-if="recipe.creator_username" class="inline-flex gap-1 items-center text-xs text-textMuted">
                {{ recipe.creator_username }}
            </span>

            <span v-if="recipe.matched_count" class="category-badges bg-successSoft text-success">
                {{ recipe.matched_count }} bahan sama
            </span>
        </div>

        <p class="flex-1 mb-2 text-sm leading-relaxed text-textSecondary line-clamp-2">
            {{ recipe.ingredients }}
        </p>

        <button class="mt-auto w-full button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse">
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
