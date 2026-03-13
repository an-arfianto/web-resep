<template>
    <div class="card-interactive">
        <div class="flex gap-2.5 justify-between items-start">
            <h3 class="flex-1 text-base font-bold leading-snug text-textPrimary">{{ recipe.name }}</h3>
            <span class="category-badges shrink-0">{{ recipe.category }}</span>
        </div>

        <div class="flex flex-wrap gap-1.5 items-center">
            <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                Oleh: {{ recipe.creator_username }}
            </span>
            <span class="text-xs text-textSecondary">Dibuat: {{ formatDate(recipe.created_at) }}</span>
        </div>

        <div v-if="recipe.ingredients" class="py-2.5 px-3 rounded-lg bg-inputBackground">
            <p class="mb-1 text-xs font-bold tracking-wider uppercase text-textSecondary">Bahan-bahan</p>
            <p class="text-sm leading-relaxed text-textSecondary line-clamp-2">{{ recipe.ingredients }}</p>
        </div>

        <div class="flex flex-wrap gap-2 justify-between items-center max-lg:flex-col max-lg:items-stretch">
            <button @click="$emit('view-detail', recipe)" class="view-detail">Lihat detail lengkap →</button>
            <div class="flex gap-2 max-sm:w-full">
                <button
                    @click="handleApprove"
                    :disabled="loading"
                    class="inline-flex flex-1 justify-center text-sm button bg-successSoft text-success hover:bg-success hover:text-textInverse"
                >
                    Setujui
                </button>
                <button
                    @click="openRejectModal"
                    :disabled="loading"
                    class="inline-flex flex-1 justify-center text-sm bg-errorSoft text-error button hover:bg-error hover:text-textInverse"
                >
                    Tolak
                </button>
            </div>
        </div>

        <teleport to="body">
            <div v-if="showRejectModal" class="modal-backdrop" @click.self="closeRejectModal">
                <div class="modal-panel max-h-[80vh] max-w-160">
                    <div class="modal-header">
                        <h2 class="modal-title">Tolak Resep</h2>
                        <button @click="closeRejectModal" aria-label="Tutup" class="modal-close-btn">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                width="17"
                                height="17"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex flex-col gap-2.5 modal-body">
                        <p class="font-semibold text-textPrimary">{{ recipe.name }}</p>
                        <p class="text-sm text-textSecondary">
                            Berikan alasan agar pembuat resep dapat memperbaikinya.
                        </p>
                        <textarea
                            v-model="rejectionReason"
                            rows="5"
                            placeholder="Contoh: Bahan-bahan tidak lengkap, instruksi kurang jelas, dll."
                            :disabled="loading"
                            :class="['input-field text-sm', showError && 'border-error focus:ring-error']"
                        ></textarea>
                        <p v-if="showError" class="text-xs text-error">Mohon berikan alasan penolakan</p>
                    </div>

                    <div class="modal-footer">
                        <button
                            @click="closeRejectModal"
                            :disabled="loading"
                            class="text-sm button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="handleReject"
                            :disabled="loading"
                            class="text-sm button bg-errorSoft text-error hover:text-textInverse hover:bg-error"
                        >
                            {{ loading ? 'Mohon Tunggu...' : 'Tolak Resep' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ModerationRecipe } from '@/types';

interface Props {
    recipe: ModerationRecipe;
}
interface Emits {
    (e: 'approve', recipeId: number): void;
    (e: 'reject', data: { recipeId: number; reason: string }): void;
    (e: 'view-detail', recipe: ModerationRecipe): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showRejectModal = ref(false);
const rejectionReason = ref('');
const loading = ref(false);
const showError = ref(false);

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openRejectModal() {
    rejectionReason.value = '';
    showError.value = false;
    showRejectModal.value = true;
}
function closeRejectModal() {
    if (loading.value) return;
    showRejectModal.value = false;
    rejectionReason.value = '';
    showError.value = false;
}

function handleApprove() {
    if (loading.value) return;
    loading.value = true;
    emit('approve', props.recipe.id);
    setTimeout(() => {
        loading.value = false;
    }, 600);
}

function handleReject() {
    if (loading.value) return;
    if (!rejectionReason.value.trim()) {
        showError.value = true;
        return;
    }
    loading.value = true;
    showError.value = false;
    emit('reject', { recipeId: props.recipe.id, reason: rejectionReason.value.trim() });
    setTimeout(() => {
        loading.value = false;
        showRejectModal.value = false;
        rejectionReason.value = '';
    }, 600);
}
</script>
