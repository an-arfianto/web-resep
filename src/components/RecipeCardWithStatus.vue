<template>
    <div
        class="overflow-hidden relative bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
    >
        <!-- status badge -->
        <div class="absolute top-3 right-3 z-10">
            <span
                :class="['rounded-full px-3 py-1 text-xs font-semibold',
                    statusStyles[recipe.status || 'pending'],
                ]"
            >
                {{ statusText[recipe.status || 'pending'] }}
            </span>
        </div>

        <RouterLink :to="`/recipe/${recipe.id}`" class="block">
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 line-clamp-2">
                    {{ recipe.name }}
                </h3>

                <div class="flex gap-2 items-center mt-2">
                    <span
                        class="py-1 px-2 text-xs font-medium text-orange-700 bg-orange-100 rounded"
                    >
                        {{ recipe.category }}
                    </span>
                </div>

                <p class="mt-3 text-sm text-gray-600 line-clamp-2">
                    {{ recipe.ingredients }}
                </p>

                <p class="mt-3 text-xs text-gray-500">
                    {{ formatDate(recipe.created_at) }}
                </p>

                <!-- alasan penolakan -->
                <div
                    v-if="recipe.status === 'rejected' && recipe.rejection_reason"
                    class="p-3 mt-4 bg-red-50 rounded-lg border border-red-200"
                >
                    <p class="text-xs font-semibold text-red-700">Alasan:</p>
                    <p class="mt-1 text-xs text-red-600">{{ recipe.rejection_reason }}</p>
                </div>
            </div>
        </RouterLink>

        <!-- button -->
        <div class="flex gap-2 p-4 border-t border-gray-200">
            <RouterLink
                :to="`/edit-recipe/${recipe.id}`"
                class="flex-1 py-2 text-sm font-medium text-center rounded-lg transition-colors text-primary-600 bg-primary-50 hover:bg-primary-100"
            >
                Edit
            </RouterLink>
            <button
                @click="handleDelete"
                class="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg transition-colors hover:bg-red-100"
            >
                Hapus
            </button>
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
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
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
