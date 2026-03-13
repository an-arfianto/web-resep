<script setup lang="ts">
import { computed } from 'vue';
import type { ModerationRecipe } from '@/types';

interface Props {
    recipe: ModerationRecipe;
}
interface Emits {
    (e: 'view-detail', recipe: ModerationRecipe): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const statusClass = computed(
    () =>
        ({
            approved: 'bg-successSoft text-success',
            pending: 'bg-warningSoft text-warning',
            rejected: 'bg-errorSoft text-error',
        })[props.recipe.status] ?? 'bg-warningSoft text-warning'
);

const statusLabel = computed(
    () =>
        ({
            approved: 'Disetujui',
            pending: 'Pending',
            rejected: 'Ditolak',
        })[props.recipe.status] ?? props.recipe.status
);

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
    <div class="card-interactive">
        <div class="flex gap-2.5 justify-between items-start">
            <h3 class="flex-1 text-base font-bold leading-snug text-textPrimary">{{ recipe.name }}</h3>
            <span :class="['status-badges shrink-0', statusClass]">{{ statusLabel }}</span>
        </div>

        <div class="flex flex-wrap gap-1.5 items-center">
            <span class="category-badges">{{ recipe.category }}</span>
            <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                Oleh: {{ recipe.creator_username }}
            </span>
        </div>

        <div class="flex flex-wrap gap-y-0.5 gap-x-4">
            <span class="text-xs text-textSecondary">Dibuat: {{ formatDate(recipe.created_at) }}</span>
            <span v-if="recipe.reviewed_at" class="text-xs text-textSecondary">
                Direview: {{ formatDate(recipe.reviewed_at) }}
                <span v-if="recipe.reviewer_username" class="text-textMuted"> Oleh {{ recipe.reviewer_username }}</span>
            </span>
        </div>

        <div v-if="recipe.status === 'rejected' && recipe.rejection_reason" class="alert-box alert-error">
            <p class="flex gap-1.5 items-center mb-1 text-xs font-bold">Alasan Penolakan</p>
            <p class="text-xs leading-relaxed line-clamp-2">{{ recipe.rejection_reason }}</p>
        </div>

        <div class="flex flex-wrap gap-2 justify-between items-center">
            <button @click="$emit('view-detail', recipe)" class="p-0 whitespace-nowrap view-detail">
                Lihat detail lengkap →
            </button>
        </div>
    </div>
</template>
