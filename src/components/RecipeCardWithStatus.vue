<template>
    <div class="transition-shadow cursor-pointer hover:shadow-lg card">
        <RouterLink :to="`/recipe/${recipe.id}`" class="block">
            <div>
                <div class="flex gap-4 justify-between items-center">
                    <h3 class="text-xl font-semibold text-textPrimary">
                        {{ recipe.name }}
                    </h3>
                    <span :class="['status-badges', statusStyles[recipe.status || 'pending']]">
                        {{ statusText[recipe.status || 'pending'] }}
                    </span>
                </div>

                <span class="mt-3 category-badges">
                    {{ recipe.category }}
                </span>

                <p class="mt-3 text-sm text-textPrimary line-clamp-2">
                    {{ recipe.ingredients }}
                </p>

                <p class="mt-3 text-xs text-textMuted">
                    {{ formatDate(recipe.created_at) }}
                </p>

                <!-- alasan penolakan -->
                <div
                    v-if="recipe.status === 'rejected' && recipe.rejection_reason"
                    class="p-3 mx-3 rounded-lg bg-errorSoft"
                >
                    <p class="text-xs font-semibold text-error">Alasan:</p>
                    <p class="mt-1 text-xs text-error">{{ recipe.rejection_reason }}</p>
                </div>
            </div>
        </RouterLink>

        <!-- button -->
        <div class="flex gap-2 pt-4 mt-3 border-t border-divider">
            <RouterLink
                :to="`/edit-recipe/${recipe.id}`"
                class="flex-1 button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
                >Edit</RouterLink
            >
            <button @click="handleDelete" class="flex-1 btn-error-soft">Hapus</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRecipeStore } from '@/stores/recipeStore';
import type { Recipe } from '@/types';

interface Props {
    recipe: Recipe;
}

const props = defineProps<Props>();
const recipeStore = useRecipeStore();

const statusStyles = {
    pending: 'bg-warningSoft text-warning',
    approved: 'bg-successSoft text-success',
    rejected: 'bg-errorSoft text-error',
};

const statusText = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

async function handleDelete() {
    if (!confirm(`Anda yakin ingin menghapus "${props.recipe.name}"?`)) {
        return;
    }

    const success = await recipeStore.deleteRecipe(props.recipe.id);
    if (success) {
        // resep telah dihapus, page tetap
    }
}
</script>
