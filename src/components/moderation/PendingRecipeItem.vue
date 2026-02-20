<template>
    <div class="flex flex-col gap-2.5 p-4 rounded-xl border transition-shadow hover:shadow-md border-border bg-surface">
        <!-- Name + category -->
        <div class="flex gap-2.5 justify-between items-start">
            <h3 class="flex-1 text-base font-bold leading-snug text-textPrimary">{{ recipe.name }}</h3>
            <span class="category-badges shrink-0">{{ recipe.category }}</span>
        </div>

        <!-- Meta -->
        <div class="flex flex-wrap gap-1.5 items-center">
            <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                {{ recipe.creator_username }}
            </span>
            <span class="text-xs text-textMuted">·</span>
            <span class="text-xs text-textSecondary">{{ formatDate(recipe.created_at) }}</span>
        </div>

        <!-- Ingredients preview -->
        <div v-if="recipe.ingredients" class="py-2.5 px-3 rounded-lg bg-inputBackground">
            <p class="mb-1 font-bold tracking-wider uppercase text-textSecondary text-[0.72rem]">Bahan-bahan</p>
            <p class="leading-relaxed text-textSecondary line-clamp-2 text-[0.8125rem]">{{ recipe.ingredients }}</p>
        </div>

        <!-- Footer -->
        <div class="flex flex-wrap gap-2 justify-between items-center max-sm:flex-col max-sm:items-stretch">
            <button
                @click="$emit('view-detail', recipe)"
                class="p-0 whitespace-nowrap bg-transparent border-none cursor-pointer view-detail"
            >
                Lihat detail lengkap →
            </button>
            <div class="flex gap-2 max-sm:w-full">
                <button
                    @click="handleApprove"
                    :disabled="loading"
                    class="inline-flex flex-1 gap-1.5 justify-center items-center py-2 px-4 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-successSoft text-success text-[0.8125rem] hover:bg-success hover:text-textInverse"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        width="13"
                        height="13"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Setujui
                </button>
                <button
                    @click="openRejectModal"
                    :disabled="loading"
                    class="inline-flex flex-1 gap-1.5 justify-center items-center py-2 px-4 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-errorSoft text-error text-[0.8125rem] hover:bg-error hover:text-textInverse"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        width="13"
                        height="13"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Tolak
                </button>
            </div>
        </div>

        <!-- Reject modal -->
        <teleport to="body">
            <transition
                enter-active-class="transition duration-200 ease-out [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-out"
                enter-from-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
                leave-active-class="transition duration-200 ease-in [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-in"
                leave-to-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
            >
                <div
                    v-if="showRejectModal"
                    class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                    style="background: rgba(0, 0, 0, 0.45)"
                    @click.self="closeRejectModal"
                >
                    <div
                        class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-w-110"
                    >
                        <!-- Header -->
                        <div
                            class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                        >
                            <h2 class="text-base font-bold text-textPrimary">Tolak Resep</h2>
                            <button
                                @click="closeRejectModal"
                                aria-label="Tutup"
                                class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary shrink-0 hover:bg-overlay hover:text-textPrimary"
                            >
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
                        <!-- Body -->
                        <div class="flex flex-col gap-2.5 py-5 px-6">
                            <p class="text-sm font-semibold text-textPrimary">{{ recipe.name }}</p>
                            <p class="text-textSecondary text-[0.8125rem]">
                                Berikan alasan agar pembuat resep dapat memperbaikinya.
                            </p>
                            <textarea
                                v-model="rejectionReason"
                                rows="5"
                                placeholder="Contoh: Bahan-bahan tidak lengkap, instruksi kurang jelas, dll."
                                :disabled="loading"
                                :class="['input-field resize-y text-sm', showError && 'border-error focus:ring-error']"
                            ></textarea>
                            <p v-if="showError" class="text-xs text-error">Mohon berikan alasan penolakan</p>
                        </div>
                        <!-- Footer -->
                        <div class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background">
                            <button
                                @click="closeRejectModal"
                                :disabled="loading"
                                class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                            >
                                Batal
                            </button>
                            <button
                                @click="handleReject"
                                :disabled="loading"
                                class="py-2 px-5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-error text-textInverse hover:opacity-85"
                            >
                                {{ loading ? 'Mohon Tunggu...' : 'Tolak Resep' }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
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
