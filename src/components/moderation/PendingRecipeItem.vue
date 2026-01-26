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
                </div>

                <div class="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                    <span>Oleh: {{ recipe.creator_username }}</span>
                    <span>{{ formatDate(recipe.created_at) }}</span>
                </div>

                <div v-if="recipe.ingredients" class="p-3 mb-3 bg-gray-50 rounded-lg">
                    <p class="mb-1 text-xs font-semibold text-gray-700 uppercase">Bahan:</p>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ recipe.ingredients }}</p>
                </div>

                <button
                    @click="$emit('view-detail', recipe)"
                    class="text-sm font-medium transition-colors text-primary-600 hover:text-primary-700"
                >
                    Lihat detail lengkap →
                </button>
            </div>

            <div class="flex flex-col flex-shrink-0 gap-2">
                <button
                    @click="handleApprove"
                    :disabled="loading"
                    class="flex gap-2 justify-center items-center py-2 px-4 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                    ✓ Setujui
                </button>
                <button
                    @click="showRejectModal = true"
                    :disabled="loading"
                    class="flex gap-2 justify-center items-center py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                    ✕ Tolak
                </button>
            </div>
        </div>

        <!-- Rejection Modal -->
        <teleport to="body">
            <div
                v-if="showRejectModal"
                class="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeRejectModal"
            >
                <div class="p-6 w-full max-w-md bg-white rounded-xl shadow-2xl">
                    <h3 class="text-lg font-bold text-gray-900">Tolak Resep</h3>
                    <p class="mt-2 text-sm text-gray-600">
                        Berikan alasan penolakan agar pembuat resep dapat memperbaikinya.
                    </p>

                    <textarea
                        v-model="rejectionReason"
                        rows="4"
                        placeholder="Contoh: Bahan-bahan tidak lengkap, instruksi kurang jelas, dll."
                        class="py-2 px-3 mt-4 w-full rounded-lg border border-gray-300 transition-all resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        :class="{ 'border-red-300': showError }"
                    ></textarea>
                    <p v-if="showError" class="mt-1 text-xs text-red-600">
                        Mohon berikan alasan penolakan
                    </p>

                    <div class="flex gap-3 justify-end mt-6">
                        <button
                            @click="closeRejectModal"
                            :disabled="loading"
                            class="py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            @click="handleReject"
                            :disabled="loading"
                            class="py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {{ loading ? 'Memproses...' : 'Tolak Resep' }}
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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function closeRejectModal() {
    if (!loading.value) {
        showRejectModal.value = false;
        rejectionReason.value = '';
        showError.value = false;
    }
}

function handleApprove() {
    if (loading.value) return;
    loading.value = true;
    emit('approve', props.recipe.id);
    setTimeout(() => {
        loading.value = false;
    }, 500);
}

function handleReject() {
    if (loading.value) return;

    if (!rejectionReason.value.trim()) {
        showError.value = true;
        return;
    }

    loading.value = true;
    showError.value = false;

    emit('reject', {
        recipeId: props.recipe.id,
        reason: rejectionReason.value.trim(),
    });

    setTimeout(() => {
        loading.value = false;
        showRejectModal.value = false;
        rejectionReason.value = '';
    }, 500);
}
</script>
