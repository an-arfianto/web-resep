<template>
    <div class="flex flex-col gap-5 py-6 px-5 mx-auto max-w-5xl">
        <div class="flex flex-wrap gap-3 justify-between items-start">
            <div>
                <h1 class="mb-0.5 text-2xl font-extrabold text-textPrimary">Kelola Resep</h1>
                <p class="text-xs text-textSecondary">{{ recipes.length }} total resep terdaftar</p>
            </div>
            <RouterLink
                to="/admin"
                class="inline-flex border button border-border bg-surface text-textSecondary hover:bg-overlay hover:text-textPrimary"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Dashboard
            </RouterLink>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-if="recipes.length === 0" class="flex flex-col gap-2 items-center py-20">
                <p class="text-base font-bold text-textPrimary">Tidak ada resep</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                    v-for="recipe in paginatedRecipes"
                    :key="recipe.id"
                    class="flex flex-col gap-2.5 p-4 rounded-xl border border-border bg-surface"
                >
                    <div class="flex gap-2.5 justify-between items-start">
                        <h3 class="flex-1 text-base font-bold leading-snug text-textPrimary line-clamp-2">
                            {{ recipe.name }}
                        </h3>
                        <span :class="['status-badges shrink-0', getStatusClass(recipe.status)]">
                            {{ statusText(recipe.status) }}
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-1.5 items-center">
                        <span class="category-badges">{{ recipe.category }}</span>
                        <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                            Oleh: {{ recipe.author }}
                        </span>
                    </div>

                    <p v-if="recipe.ingredients" class="flex-1 text-xs leading-relaxed text-textSecondary line-clamp-2">
                        {{ recipe.ingredients }}
                    </p>

                    <div v-if="recipe.status === 'rejected' && recipe.rejection_reason" class="alert-box alert-error">
                        <p class="flex gap-1.5 items-center mb-1 text-xs font-bold">Alasan</p>
                        <p class="text-xs leading-relaxed line-clamp-2">{{ recipe.rejection_reason }}</p>
                    </div>

                    <div
                        class="flex flex-wrap gap-2 justify-between items-center pt-2.5 mt-auto border-t border-divider"
                    >
                        <span class="text-textMuted text-[0.72rem]">{{ formatDate(recipe.created_at) }}</span>
                        <div class="flex gap-1.5">
                            <button
                                @click="openDetailModal(recipe.id)"
                                class="inline-flex gap-1.5 items-center py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-colors bg-secondarySoft text-secondary hover:bg-secondary hover:text-textInverse"
                            >
                                Detail
                            </button>
                            <button
                                @click="deleteRecipe(recipe.id)"
                                :disabled="deletingId === recipe.id"
                                class="inline-flex gap-1.5 items-center py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-errorSoft text-error hover:bg-error hover:text-textInverse"
                            >
                                {{ deletingId === recipe.id ? '...' : 'Hapus' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination
                v-if="recipes.length > itemsPerPage"
                :current-page="currentPage"
                :total-items="recipes.length"
                :items-per-page="itemsPerPage"
                @page-change="handlePageChange"
            />
        </template>

        <teleport to="body">
            <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
                <div class="modal-panel max-h-[88vh] max-w-160">
                    <div v-if="loadingDetail" class="flex justify-center items-center p-20">
                        <div class="loading-spin"></div>
                    </div>

                    <template v-else-if="selectedRecipe">
                        <div class="modal-header">
                            <div class="flex-1 min-w-0">
                                <h2 class="mb-2 modal-title">{{ selectedRecipe.name }}</h2>
                                <div class="flex flex-wrap gap-1.5">
                                    <span class="category-badges">{{ selectedRecipe.category }}</span>
                                    <span :class="['status-badges', getStatusClass(selectedRecipe.status)]">
                                        {{ statusText(selectedRecipe.status) }}
                                    </span>
                                </div>
                            </div>
                            <button @click="closeDetailModal" aria-label="Tutup" class="modal-close-btn">
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
                            <div class="flex flex-col gap-1.5 py-3 px-4 rounded-lg bg-background">
                                <div class="flex gap-2 text-sm">
                                    <span class="w-24 font-semibold text-textSecondary shrink-0">Oleh</span>
                                    <span class="text-textPrimary">{{
                                        selectedRecipe.creator_username || selectedRecipe.author || 'Unknown'
                                    }}</span>
                                </div>
                                <div class="flex gap-2 text-sm">
                                    <span class="w-24 font-semibold text-textSecondary shrink-0">Dibuat</span>
                                    <span class="text-textPrimary">{{ formatDate(selectedRecipe.created_at) }}</span>
                                </div>
                                <div
                                    v-if="selectedRecipe.status !== 'pending' && selectedRecipe.reviewer_username"
                                    class="flex gap-2 text-sm"
                                >
                                    <span class="w-24 font-semibold text-textSecondary shrink-0">Direview oleh</span>
                                    <span class="text-textPrimary">
                                        {{ selectedRecipe.reviewer_username }}
                                        <span v-if="selectedRecipe.reviewed_at" class="text-textSecondary">
                                            — {{ formatDate(selectedRecipe.reviewed_at) }}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div v-if="selectedRecipe.description">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Deskripsi</p>
                                <p class="text-sm leading-relaxed text-textSecondary">
                                    {{ selectedRecipe.description }}
                                </p>
                            </div>

                            <div v-if="selectedRecipe.ingredients">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Bahan-bahan</p>
                                <div v-if="Array.isArray(selectedRecipe.ingredients)" class="flex flex-col gap-1">
                                    <p
                                        v-for="(ing, idx) in selectedRecipe.ingredients"
                                        :key="idx"
                                        class="text-sm text-textSecondary"
                                    >
                                        • {{ formatIngredient(ing) }}
                                    </p>
                                </div>
                                <p v-else class="text-sm leading-relaxed whitespace-pre-line text-textSecondary">
                                    {{ selectedRecipe.ingredients }}
                                </p>
                            </div>

                            <div v-if="selectedRecipe.instructions">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Instruksi</p>
                                <p class="text-sm leading-relaxed whitespace-pre-line text-textSecondary">
                                    {{ selectedRecipe.instructions }}
                                </p>
                            </div>

                            <div
                                v-if="selectedRecipe.status === 'rejected' && selectedRecipe.rejection_reason"
                                class="alert-box alert-error"
                            >
                                <p class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error">
                                    Alasan Penolakan
                                </p>
                                <p class="text-sm leading-relaxed text-error">{{ selectedRecipe.rejection_reason }}</p>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button
                                @click="closeDetailModal"
                                class="button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                            >
                                Tutup
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showDeleteModal" class="modal-backdrop" @click.self="cancelDelete">
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Hapus Resep</h2>
                        <button @click="cancelDelete" aria-label="Tutup" class="modal-close-btn">
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
                            Anda yakin ingin menghapus resep
                            <strong class="text-textPrimary">{{ pendingDeleteName }}</strong
                            >? Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    <div class="modal-footer">
                        <button
                            @click="cancelDelete"
                            class="button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="deletingId !== null"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-error text-textInverse hover:opacity-85"
                        >
                            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

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
import axios from 'axios';
import Pagination from '@/components/Pagination.vue';

const recipes = ref<any[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;

const deletingId = ref<number | null>(null);
const showDeleteModal = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

const showDetailModal = ref(false);
const loadingDetail = ref(false);
const selectedRecipe = ref<any>(null);

const showSuccessToast = ref(false);
const successMessage = ref('');

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return recipes.value.slice(start, start + itemsPerPage);
});

onMounted(() => {
    fetchRecipes();
});

async function fetchRecipes() {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/recipes', {
            headers: { Authorization: `Bearer ${token}` },
        });
        recipes.value = response.data.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function openDetailModal(recipeId: number) {
    showDetailModal.value = true;
    loadingDetail.value = true;
    selectedRecipe.value = null;

    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/recipes/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        selectedRecipe.value = response.data.data;
    } catch (err) {
        console.error('Failed to fetch recipe details:', err);
        alert('Gagal memuat detail resep');
        closeDetailModal();
    } finally {
        loadingDetail.value = false;
    }
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedRecipe.value = null;
    loadingDetail.value = false;
}

function formatIngredient(ing: any): string {
    if (typeof ing === 'string') return ing;

    const parts = [];
    if (ing.quantity) parts.push(ing.quantity);
    if (ing.unit) parts.push(ing.unit);
    parts.push(ing.name || ing.ingredient);

    return parts.join(' ');
}

function deleteRecipe(id: number) {
    const recipe = recipes.value.find((r) => r.id === id);
    pendingDeleteId.value = id;
    pendingDeleteName.value = recipe?.name ?? '';
    showDeleteModal.value = true;
}

function cancelDelete() {
    if (deletingId.value !== null) return;
    showDeleteModal.value = false;
    pendingDeleteId.value = null;
    pendingDeleteName.value = '';
}

async function confirmDelete() {
    if (!pendingDeleteId.value) return;
    deletingId.value = pendingDeleteId.value;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/recipes/${pendingDeleteId.value}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        recipes.value = recipes.value.filter((r) => r.id !== pendingDeleteId.value);
        if (paginatedRecipes.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
        }
        showDeleteModal.value = false;
        pendingDeleteId.value = null;
        pendingDeleteName.value = '';
    } catch (err: any) {
        alert('Gagal menghapus resep: ' + err.message);
    } finally {
        deletingId.value = null;
    }
}

function getStatusClass(status: string) {
    return (
        {
            approved: 'bg-successSoft text-success',
            pending: 'bg-warningSoft text-warning',
            rejected: 'bg-errorSoft text-error',
        }[status] ?? 'bg-warningSoft text-warning'
    );
}

function statusText(status: string): string {
    return { approved: 'Disetujui', pending: 'Pending', rejected: 'Ditolak' }[status] ?? status;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
