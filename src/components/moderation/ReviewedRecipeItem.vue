<template>
    <div
        class="flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-px border-border bg-surface focus-visible:outline-primary focus-visible:outline focus-visible:outline-2"
        role="button"
        tabindex="0"
        @click="$emit('view-detail', recipe)"
        @keydown.enter="$emit('view-detail', recipe)"
        @keydown.space.prevent="$emit('view-detail', recipe)"
    >
        <!-- Name + status -->
        <div class="flex gap-2.5 justify-between items-start">
            <h3 class="flex-1 text-base font-bold leading-snug text-textPrimary">{{ recipe.name }}</h3>
            <span :class="['status-badges shrink-0', statusClass]">{{ statusLabel }}</span>
        </div>

        <!-- Category + author -->
        <div class="flex flex-wrap gap-1.5 items-center">
            <span class="category-badges">{{ recipe.category }}</span>
            <span class="text-xs text-textMuted">·</span>
            <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                {{ recipe.creator_username }}
            </span>
        </div>

        <!-- Dates -->
        <div class="flex flex-wrap gap-y-0.5 gap-x-4">
            <span class="text-xs text-textSecondary">Dibuat: {{ formatDate(recipe.created_at) }}</span>
            <span v-if="recipe.reviewed_at" class="text-xs text-textSecondary">
                Direview: {{ formatDate(recipe.reviewed_at) }}
                <span v-if="recipe.reviewer_username" class="text-textMuted"> oleh {{ recipe.reviewer_username }}</span>
            </span>
        </div>

        <!-- Rejection reason -->
        <div
            v-if="recipe.status === 'rejected' && recipe.rejection_reason"
            class="py-2.5 px-3 rounded-lg border-error bg-errorSoft border-l-[3px]"
        >
            <p class="flex gap-1.5 items-center mb-1 text-xs font-bold text-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Alasan Penolakan
            </p>
            <p class="text-xs leading-relaxed text-error line-clamp-2">{{ recipe.rejection_reason }}</p>
        </div>

        <!-- View hint -->
        <span class="p-0 mt-0.5 text-xs bg-transparent border-none view-detail">Lihat detail lengkap →</span>
    </div>
</template>

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
