<template>
    <div class="flex flex-col gap-5 py-6 px-4 mx-auto w-full max-w-7xl lg:px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h1 class="text-2xl font-bold lg:text-3xl text-textPrimary">Resep Saya</h1>
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
            <div class="alert-box alert-box-error">
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
                    >
                        {{ myRecipes.length }}
                    </span>
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
                            filterStatus === 'approved' ? 'bg-white/20' : 'bg-successSoft text-success',
                        ]"
                    >
                        {{ approvedCount }}
                    </span>
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
                            filterStatus === 'pending' ? 'bg-white/20' : 'bg-warningSoft text-warning',
                        ]"
                    >
                        {{ pendingCount }}
                    </span>
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
                    >
                        {{ rejectedCount }}
                    </span>
                </button>
            </div>

            <div v-if="filteredRecipes.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RecipeCardWithStatus
                    v-for="recipe in filteredRecipes"
                    :key="recipe.id"
                    :recipe="recipe"
                    @recipe-deleted="handleRecipeDeleted"
                />
            </div>

            <div v-else class="flex flex-col gap-3 items-center py-20 card">
                <div class="text-center">
                    <p class="text-lg font-bold text-textPrimary">Tidak ada resep {{ getStatusText(filterStatus) }}</p>
                    <p class="mt-1 text-sm text-textSecondary">Coba pilih filter lain atau buat resep baru</p>
                </div>
            </div>
        </template>

        <div v-else class="flex flex-col gap-4 items-center py-20 card">
            <div class="text-center">
                <p class="text-xl font-bold text-textPrimary">Anda belum membuat resep</p>
                <p class="mt-1 text-sm text-textSecondary">Mulai dengan membuat resep pertama Anda</p>
            </div>
            <RouterLink to="/create-recipe" class="mt-2 button bg-primary text-textInverse hover:opacity-85">
                Buat Resep Pertama
            </RouterLink>
        </div>

        <teleport to="body">
            <div
                v-if="showSuccessToast"
                class="flex fixed right-5 bottom-5 gap-3 items-start py-3 px-4 w-80 rounded-xl border shadow-lg border-success/30 bg-successSoft text-success z-60 max-w-[calc(100vw-40px)]"
            >
                <p class="flex-1 text-sm font-medium leading-snug">{{ successMessage }}</p>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import RecipeCardWithStatus from '@/components/RecipeCardWithStatus.vue';
import type { Recipe } from '@/types';

const recipeStore = useRecipeStore();

const filterStatus = ref<'all' | 'approved' | 'pending' | 'rejected'>('all');

const showSuccessToast = ref(false);
const successMessage = ref('');

const myRecipes = computed<Recipe[]>(() => recipeStore.myRecipes);

const filteredRecipes = computed(() => {
    if (filterStatus.value === 'all') return myRecipes.value;
    return myRecipes.value.filter((r) => r.status === filterStatus.value);
});

const approvedCount = computed(() => myRecipes.value.filter((r) => r.status === 'approved').length);
const pendingCount = computed(() => myRecipes.value.filter((r) => r.status === 'pending').length);
const rejectedCount = computed(() => myRecipes.value.filter((r) => r.status === 'rejected').length);

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
    const statusMap: Record<string, string> = {
        all: '',
        approved: 'yang disetujui',
        pending: 'yang pending',
        rejected: 'yang ditolak',
    };
    return statusMap[status] || '';
}

onMounted(async () => {
    await recipeStore.fetchMyRecipes();
});
</script>
