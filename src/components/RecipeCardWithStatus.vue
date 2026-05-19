<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import { formatDate } from '@/utils/recipeUtils';
import type { Recipe } from '@/types';

const emit = defineEmits<{
    (e: 'recipe-deleted', recipeName: string): void;
    (e: 'view-detail', recipe: Recipe): void;
}>();

interface Props {
    recipe: Recipe;
}

const props = defineProps<Props>();
const router = useRouter();
const recipeStore = useRecipeStore();

const showDeleteModal = ref(false);
const deleteLoading = ref(false);

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

function handleCardClick() {
    if (props.recipe.status === 'approved') {
        router.push(`/recipe/${props.recipe.id}`);
    } else {
        emit('view-detail', props.recipe);
    }
}

function goToEdit() {
    router.push(`/edit-recipe/${props.recipe.id}`);
}

function openDeleteModal() {
    showDeleteModal.value = true;
}
function closeDeleteModal() {
    if (deleteLoading.value) return;
    showDeleteModal.value = false;
}

async function confirmDelete() {
    deleteLoading.value = true;
    const recipeName = props.recipe.name;
    try {
        const success = await recipeStore.deleteRecipe(props.recipe.id);
        if (success) {
            showDeleteModal.value = false;
            emit('recipe-deleted', recipeName);
        }
    } finally {
        deleteLoading.value = false;
    }
}
</script>

<template>
    <div class="card-interactive" @click="handleCardClick">
        <div class="flex gap-3 justify-between items-start">
            <h3 class="flex-1 text-lg font-bold leading-snug text-textPrimary line-clamp-2">
                {{ recipe.name }}
            </h3>
            <span :class="['status-badges shrink-0', statusStyles[recipe.status || 'pending']]">
                {{ statusText[recipe.status || 'pending'] }}
            </span>
        </div>

        <div>
            <span class="category-badges">{{ recipe.category }}</span>
        </div>

        <p class="text-sm leading-relaxed text-textSecondary line-clamp-2">
            {{ recipe.ingredients }}
        </p>

        <p class="text-xs text-textMuted">{{ formatDate(recipe.created_at) }}</p>

        <div
            v-if="recipe.status === 'rejected' && recipe.rejection_reason"
            class="alert-box alert-error"
        >
            <p class="flex gap-1.5 items-center mb-1 text-xs font-bold">Alasan Penolakan</p>
            <p class="text-xs leading-relaxed">{{ recipe.rejection_reason }}</p>
        </div>

        <div class="flex gap-2 pt-3 mt-auto border-t border-divider">
            <button
                @click.stop="goToEdit"
                class="flex-1 button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
            >
                Edit
            </button>
            <button
                @click.stop="openDeleteModal"
                class="flex-1 button bg-errorSoft text-error hover:bg-error hover:text-textInverse"
            >
                Hapus
            </button>
        </div>

        <teleport to="body">
            <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Hapus Resep</h2>
                        <button
                            @click="closeDeleteModal"
                            aria-label="Tutup"
                            class="modal-close-btn"
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
                    <div class="modal-body">
                        <p class="text-sm leading-relaxed text-textSecondary">
                            Anda yakin ingin menghapus
                            <strong class="text-textPrimary">{{ recipe.name }}</strong
                            >?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="closeDeleteModal"
                            :disabled="deleteLoading"
                            class="disabled:opacity-50 button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="deleteLoading"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-error text-textInverse hover:opacity-85"
                        >
                            {{ deleteLoading ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>
