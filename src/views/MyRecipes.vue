<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import RecipeCardWithStatus from '@/components/RecipeCardWithStatus.vue';
import type { Recipe, Ingredient } from '@/types';
import { formatDate } from '@/utils/recipeUtils';

const recipeStore = useRecipeStore();

const filterStatus = ref<'all' | 'approved' | 'pending' | 'rejected'>('all');
const showSuccessToast = ref(false);
const successMessage = ref('');

const showDetailModal = ref(false);
const selectedRecipe = ref<Recipe | null>(null);

const myRecipes = computed<Recipe[]>(() => recipeStore.myRecipes);

const filteredRecipes = computed(() => {
    if (filterStatus.value === 'all') return myRecipes.value;
    return myRecipes.value.filter((r) => r.status === filterStatus.value);
});

const approvedCount = computed(() => myRecipes.value.filter((r) => r.status === 'approved').length);
const pendingCount = computed(() => myRecipes.value.filter((r) => r.status === 'pending').length);
const rejectedCount = computed(() => myRecipes.value.filter((r) => r.status === 'rejected').length);

const ingredientsList = computed<Ingredient[]>(() => {
    if (!selectedRecipe.value) return [];
    if (Array.isArray(selectedRecipe.value.ingredients)) return selectedRecipe.value.ingredients;
    if (typeof selectedRecipe.value.ingredients === 'string') {
        return selectedRecipe.value.ingredients.split(',').map((i) => ({
            name: i.trim(),
            quantity: null,
            unit: null,
        }));
    }
    return [];
});

function openDetailModal(recipe: Recipe) {
    selectedRecipe.value = recipe;
    showDetailModal.value = true;
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedRecipe.value = null;
}

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

function handleRecipeDeleted(recipeName: string) {
    showSuccess(`Resep "${recipeName}" berhasil dihapus!`);
}

function getStatusText(status: string): string {
    return (
        { all: '', approved: 'yang disetujui', pending: 'yang pending', rejected: 'yang ditolak' }[
            status
        ] || ''
    );
}

onMounted(async () => {
    await recipeStore.showMyRecipes();
});
</script>

<template>
    <div class="container-body">
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h1 class="mb-1 card-title">Resep Saya</h1>
            <RouterLink
                to="/create-recipe"
                class="inline-flex gap-1.5 items-center button bg-successSoft text-success hover:bg-success hover:text-textInverse"
            >
                Tambah Resep
            </RouterLink>
        </div>

        <div v-if="recipeStore.loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="recipeStore.error" class="card">
            <div class="alert-box">
                <p class="text-sm font-semibold text-error">{{ recipeStore.error }}</p>
            </div>
        </div>

        <template v-else-if="myRecipes.length > 0">
            <div class="flex flex-wrap gap-2">
                <button
                    @click="filterStatus = 'all'"
                    :class="['button transition-colors',
                        filterStatus === 'all'
                            ? 'bg-primary text-textInverse'
                            : 'bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary',
                    ]"
                >
                    Semua
                    <span
                        :class="['ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold',
                            filterStatus === 'all' ? 'bg-white/20' : 'bg-overlay',
                        ]"
                        >{{ myRecipes.length }}</span
                    >
                </button>
                <button
                    @click="filterStatus = 'approved'"
                    :class="['button transition-colors',
                        filterStatus === 'approved'
                            ? 'bg-success text-textInverse'
                            : 'bg-overlay text-textSecondary hover:bg-successSoft hover:text-success',
                    ]"
                >
                    Disetujui
                    <span
                        :class="['ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold',
                            filterStatus === 'approved'
                                ? 'bg-white/20'
                                : 'bg-successSoft text-success',
                        ]"
                        >{{ approvedCount }}</span
                    >
                </button>
                <button
                    @click="filterStatus = 'pending'"
                    :class="['button transition-colors',
                        filterStatus === 'pending'
                            ? 'bg-warning text-textInverse'
                            : 'bg-overlay text-textSecondary hover:bg-warningSoft hover:text-warning',
                    ]"
                >
                    Pending
                    <span
                        :class="['ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold',
                            filterStatus === 'pending'
                                ? 'bg-white/20'
                                : 'bg-warningSoft text-warning',
                        ]"
                        >{{ pendingCount }}</span
                    >
                </button>
                <button
                    @click="filterStatus = 'rejected'"
                    :class="['button transition-colors',
                        filterStatus === 'rejected'
                            ? 'bg-error text-textInverse'
                            : 'bg-overlay text-textSecondary hover:bg-errorSoft hover:text-error',
                    ]"
                >
                    Ditolak
                    <span
                        :class="['ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold',
                            filterStatus === 'rejected' ? 'bg-white/20' : 'bg-errorSoft text-error',
                        ]"
                        >{{ rejectedCount }}</span
                    >
                </button>
            </div>

            <div
                v-if="filteredRecipes.length > 0"
                class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
                <RecipeCardWithStatus
                    v-for="recipe in filteredRecipes"
                    :key="recipe.id"
                    :recipe="recipe"
                    @recipe-deleted="handleRecipeDeleted"
                    @view-detail="openDetailModal"
                />
            </div>

            <div v-else class="flex flex-col gap-3 items-center py-20 card">
                <p class="text-lg font-bold text-textPrimary">
                    Tidak ada resep {{ getStatusText(filterStatus) }}
                </p>
                <p class="mt-1 text-sm text-textSecondary">
                    Coba pilih filter lain atau buat resep baru
                </p>
            </div>
        </template>

        <div v-else class="flex flex-col gap-4 items-center py-20 card">
            <p class="text-xl font-bold text-textPrimary">Anda belum membuat resep</p>
            <p class="mt-1 text-sm text-textSecondary">Mulai dengan membuat resep pertama Anda</p>
            <RouterLink
                to="/create-recipe"
                class="mt-2 button bg-primary text-textInverse hover:opacity-85"
            >
                Buat Resep Pertama
            </RouterLink>
        </div>

        <teleport to="body">
            <div
                v-if="showDetailModal && selectedRecipe"
                class="modal-backdrop"
                @click.self="closeDetailModal"
            >
                <div class="max-w-2xl modal-panel max-h-[85vh]">
                    <div class="modal-header">
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap gap-2 items-center mb-1">
                                <p class="modal-title">
                                    {{ selectedRecipe.name }}
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-1.5">
                                <span class="category-badges">{{ selectedRecipe.category }}</span>
                                <span
                                    :class="['status-badges',
                                        selectedRecipe.status === 'pending'
                                            ? 'bg-warningSoft text-warning'
                                            : 'bg-errorSoft text-error',
                                    ]"
                                >
                                    {{
                                        selectedRecipe.status === 'pending' ? 'Pending' : 'Ditolak'
                                    }}
                                </span>
                            </div>
                        </div>
                        <button @click="closeDetailModal" class="modal-close-btn">
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

                    <div class="flex overflow-y-auto flex-col flex-1 gap-5 modal-body">
                        <div
                            v-if="selectedRecipe.status === 'pending'"
                            class="alert-box border-warning bg-warningSoft"
                        >
                            <p class="text-sm font-bold text-warning">Menunggu Review</p>
                            <p class="text-sm text-warning/80">
                                Resep ini sedang menunggu persetujuan admin dan belum tampil ke
                                publik.
                            </p>
                        </div>
                        <div v-else-if="selectedRecipe.status === 'rejected'" class="alert-box">
                            <p class="text-sm font-bold text-error">Resep Ditolak</p>
                            <p
                                v-if="selectedRecipe.rejection_reason"
                                class="mt-0.5 text-sm text-error/80"
                            >
                                Alasan: {{ selectedRecipe.rejection_reason }}
                            </p>
                            <p v-else class="mt-0.5 text-sm text-error/80">
                                Resep ini ditolak oleh admin. Silakan edit dan kirim ulang.
                            </p>
                        </div>

                        <div class="alert-box bg-background border-background">
                            <span class="text-textSecondary">Dibuat:</span>
                            <span class="font-medium text-textPrimary">{{
                                formatDate(selectedRecipe.created_at)
                            }}</span>
                        </div>

                        <div v-if="selectedRecipe.description">
                            <p class="mb-1.5 text-sm font-bold text-textPrimary">Deskripsi</p>
                            <p class="text-sm leading-relaxed text-textSecondary">
                                {{ selectedRecipe.description }}
                            </p>
                        </div>

                        <div v-if="ingredientsList.length">
                            <p class="mb-1.5 text-sm font-bold text-textPrimary">Bahan-bahan</p>
                            <div class="flex flex-col gap-1 p-3 rounded-lg bg-background">
                                <div
                                    v-for="(ing, idx) in ingredientsList"
                                    :key="idx"
                                    class="flex gap-1 items-start text-sm"
                                >
                                    <span class="text-primary shrink-0">•</span>
                                    <span class="text-textPrimary">
                                        <span v-if="ing.quantity" class="font-semibold"
                                            >{{ ing.quantity }}{{ ing.unit ? ' ' + ing.unit : '' }}
                                        </span>
                                        {{ ing.name }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedRecipe.instructions">
                            <p class="mb-1.5 text-sm font-bold text-textPrimary">Instruksi</p>
                            <p
                                class="p-3 text-sm leading-relaxed whitespace-pre-line rounded-lg text-textSecondary bg-background"
                            >
                                {{ selectedRecipe.instructions }}
                            </p>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <RouterLink
                            :to="`/edit-recipe/${selectedRecipe.id}`"
                            @click="closeDetailModal"
                            class="button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
                        >
                            Edit Resep
                        </RouterLink>
                        <button
                            @click="closeDetailModal"
                            class="button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showSuccessToast" class="fixed top-5 right-5 toast toast-success">
                <p class="flex-1 font-medium">{{ successMessage }}</p>
                <button
                    @click="showSuccessToast = false"
                    class="mt-0.5 opacity-60 transition-opacity hover:opacity-100 shrink-0"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        width="14"
                        height="14"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </teleport>
    </div>
</template>
