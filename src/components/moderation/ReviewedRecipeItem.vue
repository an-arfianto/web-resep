<template>
    <div
        class="p-4 bg-white rounded-lg border border-gray-200 transition-colors hover:shadow-md hover:border-primary-300"
    >
        <div class="flex gap-4 justify-between items-start">
            <div class="flex-1 min-w-0">
                <div class="flex flex-wrap gap-2 items-center mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                        {{ recipe.name }}
                    </h3>
                    <span
                        class="inline-block flex-shrink-0 py-1 px-2.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full"
                    >
                        {{ recipe.category }}
                    </span>
                    <span
                        :class="['inline-block flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                            statusStyles[recipe.status],
                        ]"
                    >
                        {{ statusText[recipe.status] }}
                    </span>
                </div>

                <div class="mb-3 space-y-1 text-sm text-gray-600">
                    <p>Oleh: {{ recipe.creator_username }}</p>
                    <p>Dibuat: {{ formatDate(recipe.created_at) }}</p>
                    <p v-if="recipe.reviewed_at">
                        Direview: {{ formatDate(recipe.reviewed_at) }}
                        <span v-if="recipe.reviewer_username" class="text-gray-500">
                            oleh {{ recipe.reviewer_username }}
                        </span>
                    </p>
                </div>

                <div
                    v-if="recipe.status === 'rejected' && recipe.rejection_reason"
                    class="p-3 mb-3 bg-red-50 rounded-lg border border-red-200"
                >
                    <p class="text-xs font-semibold text-red-700">Alasan Penolakan:</p>
                    <p class="mt-1 text-sm text-red-600">{{ recipe.rejection_reason }}</p>
                </div>

                <button
                    @click="$emit('view-detail', recipe)"
                    class="text-sm font-medium transition-colors text-primary-600 hover:text-primary-700"
                >
                    Lihat detail lengkap →
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ModerationRecipe } from '@/types';

interface Props {
    recipe: ModerationRecipe;
}

interface Emits {
    (e: 'view-detail', recipe: ModerationRecipe): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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
        month: 'short',
        day: 'numeric',
    });
}
</script>
