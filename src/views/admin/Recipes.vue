<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import Pagination from '@/components/Pagination.vue';
import type { Recipe } from '@/types';
import { formatDate } from '@/utils/recipeUtils';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

const activeTab = ref<TabKey>('pending');

const TABS = [
    { key: 'all' as TabKey, label: 'Semua' },
    { key: 'pending' as TabKey, label: 'Pending' },
    { key: 'approved' as TabKey, label: 'Disetujui' },
    { key: 'rejected' as TabKey, label: 'Ditolak' },
];
const recipes = ref<Recipe[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 12;

const deletingId = ref<number | null>(null);
const showDeleteModal = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

const showDetailModal = ref(false);
const loadingDetail = ref(false);
const selectedRecipe = ref<Recipe | null>(null);

const showApproveModal = ref(false);
const showRejectModal = ref(false);
const pendingActionId = ref<number | null>(null);
const pendingActionName = ref('');
const rejectReason = ref('');
const actionLoading = ref(false);

const showSuccessToast = ref(false);
const successMessage = ref('');

const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return recipes.value.slice(start, start + itemsPerPage);
});

onMounted(() => {
    showRecipes('pending');
});

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

async function showRecipes(tab: TabKey = activeTab.value) {
    loading.value = true;
    currentPage.value = 1;
    try {
        let response;
        if (tab === 'all') {
            response = await api.admin.showAllRecipes();
        } else if (tab === 'pending') {
            response = await api.admin.showPendingRecipes();
        } else {
            response = await api.admin.showRecipesByStatus(tab);
        }
        recipes.value = response.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

function handleTabChange(tab: TabKey) {
    if (tab === activeTab.value) return;
    activeTab.value = tab;
    recipes.value = [];
    showRecipes(tab);
}

async function openDetailModal(recipeId: number) {
    showDetailModal.value = true;
    loadingDetail.value = true;
    selectedRecipe.value = null;
    try {
        const response = await api.admin.showRecipe(recipeId);
        selectedRecipe.value = response.data as Recipe;
    } catch (err) {
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

function openApproveModal(id: number, name: string) {
    pendingActionId.value = id;
    pendingActionName.value = name;
    showApproveModal.value = true;
}

function openRejectModal(id: number, name: string) {
    pendingActionId.value = id;
    pendingActionName.value = name;
    rejectReason.value = '';
    showRejectModal.value = true;
}

function cancelApprove() {
    showApproveModal.value = false;
    pendingActionId.value = null;
}
function cancelReject() {
    showRejectModal.value = false;
    pendingActionId.value = null;
    rejectReason.value = '';
}

async function confirmApprove() {
    if (!pendingActionId.value) return;
    actionLoading.value = true;
    try {
        await api.admin.approveRecipe(pendingActionId.value);
        if (activeTab.value === 'pending') {
            recipes.value = recipes.value.filter((r) => r.id !== pendingActionId.value);
            if (paginatedRecipes.value.length === 0 && currentPage.value > 1) currentPage.value--;
        } else {
            const recipe = recipes.value.find((r) => r.id === pendingActionId.value);
            if (recipe) recipe.status = 'approved';
        }
        showSuccess(`Resep "${pendingActionName.value}" berhasil disetujui.`);
        if (selectedRecipe.value?.id === pendingActionId.value)
            selectedRecipe.value.status = 'approved';
    } catch (err: any) {
        alert('Gagal menyetujui resep: ' + err.message);
    } finally {
        actionLoading.value = false;
        cancelApprove();
    }
}

async function confirmReject() {
    if (!pendingActionId.value) return;
    actionLoading.value = true;
    try {
        await api.admin.rejectRecipe(pendingActionId.value, rejectReason.value || undefined);
        if (activeTab.value === 'pending') {
            recipes.value = recipes.value.filter((r) => r.id !== pendingActionId.value);
            if (paginatedRecipes.value.length === 0 && currentPage.value > 1) currentPage.value--;
        } else {
            const recipe = recipes.value.find((r) => r.id === pendingActionId.value);
            if (recipe) {
                recipe.status = 'rejected';
                recipe.rejection_reason = rejectReason.value || null;
            }
        }
        showSuccess(`Resep "${pendingActionName.value}" berhasil ditolak.`);
        if (selectedRecipe.value?.id === pendingActionId.value) {
            selectedRecipe.value.status = 'rejected';
            selectedRecipe.value.rejection_reason = rejectReason.value || null;
        }
    } catch (err: any) {
        alert('Gagal menolak resep: ' + err.message);
    } finally {
        actionLoading.value = false;
        cancelReject();
    }
}

function openDeleteModal(id: number, name: string) {
    pendingDeleteId.value = id;
    pendingDeleteName.value = name;
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
    const recipeName = pendingDeleteName.value;
    try {
        await api.admin.deleteRecipe(pendingDeleteId.value);
        recipes.value = recipes.value.filter((r) => r.id !== pendingDeleteId.value);
        if (paginatedRecipes.value.length === 0 && currentPage.value > 1) currentPage.value--;
        showDeleteModal.value = false;
        pendingDeleteId.value = null;
        pendingDeleteName.value = '';
        showSuccess(`Resep "${recipeName}" berhasil dihapus!`);
    } catch (err: any) {
        alert('Gagal menghapus resep: ' + err.message);
    } finally {
        deletingId.value = null;
    }
}

function formatIngredient(ing: any): string {
    if (typeof ing === 'string') return ing;
    const parts = [];
    if (ing.quantity) parts.push(ing.quantity);
    if (ing.unit) parts.push(ing.unit);
    parts.push(ing.name || ing.ingredient);
    return parts.join(' ');
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

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
    <div class="flex flex-col gap-5 py-6 px-4 mx-auto w-full max-w-6xl lg:px-6">
        <div class="flex flex-wrap gap-3 justify-between items-start">
            <div>
                <h1 class="mb-0.5 text-2xl font-extrabold text-textPrimary">Kelola Resep</h1>
                <p class="text-xs text-textSecondary">{{ recipes.length }} resep ditemukan</p>
            </div>
            <RouterLink
                to="/admin"
                class="inline-flex border button border-border bg-surface text-textSecondary hover:bg-overlay hover:text-textPrimary"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="15"
                    height="15"
                >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Dashboard
            </RouterLink>
        </div>

        <div class="flex flex-wrap gap-2">
            <button
                v-for="tab in TABS"
                :key="tab.key"
                @click="handleTabChange(tab.key)"
                class="py-2 px-4 text-sm font-semibold rounded-lg border transition-colors"
                :class="
                    activeTab === tab.key
                        ? 'border-primary bg-primary text-textInverse'
                        : 'border-border bg-surface text-textPrimary hover:bg-overlay hover:text-textPrimary'
                "
            >
                {{ tab.label }}
            </button>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-if="recipes.length === 0" class="flex flex-col gap-2 items-center py-20">
                <p class="text-base font-bold text-textPrimary">Tidak ada resep</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div
                    v-for="recipe in paginatedRecipes"
                    :key="recipe.id"
                    class="flex flex-col gap-2.5 p-4 rounded-xl border border-border bg-surface"
                >
                    <div class="flex gap-2.5 justify-between items-start">
                        <h3
                            class="flex-1 text-base font-bold leading-snug text-textPrimary line-clamp-2"
                        >
                            {{ recipe.name }}
                        </h3>
                        <span
                            :class="['status-badges shrink-0',
                                getStatusClass(recipe.status ?? 'pending'),
                            ]"
                        >
                            {{ statusText(recipe.status ?? 'pending') }}
                        </span>
                    </div>

                    <div class="flex gap-1.5 items-center">
                        <p class="text-xs text-textSecondary">
                            Oleh: {{ recipe.creator_username ?? '-' }}
                        </p>
                        <span
                            v-if="recipe.creator_is_suspended"
                            class="py-0.5 px-1.5 text-xs font-bold rounded bg-errorSoft text-error"
                            >Disuspend</span
                        >
                    </div>
                    <p class="text-xs text-textSecondary">{{ formatDate(recipe.created_at) }}</p>

                    <div class="flex flex-wrap gap-2 pt-1 mt-auto border-t border-divider">
                        <button
                            @click="openDetailModal(recipe.id)"
                            class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors bg-overlay text-textSecondary hover:bg-divider"
                        >
                            Detail
                        </button>
                        <template
                            v-if="recipe.status === 'pending' && !recipe.creator_is_suspended"
                        >
                            <button
                                @click="openApproveModal(recipe.id, recipe.name)"
                                class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-successSoft text-success"
                            >
                                Setujui
                            </button>
                            <button
                                @click="openRejectModal(recipe.id, recipe.name)"
                                class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-warningSoft text-warning"
                            >
                                Tolak
                            </button>
                        </template>
                        <button
                            @click="openDeleteModal(recipe.id, recipe.name)"
                            class="py-1.5 px-3 ml-auto text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-errorSoft text-error"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>

            <Pagination
                v-if="recipes.length > itemsPerPage"
                :total="recipes.length"
                :per-page="itemsPerPage"
                :current-page="currentPage"
                @page-change="handlePageChange"
            />
        </template>

        <teleport to="body">
            <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
                <div class="modal-panel max-h-[80vh] max-w-160">
                    <div v-if="loadingDetail" class="flex justify-center items-center p-20">
                        <div class="loading-spin"></div>
                    </div>
                    <template v-else-if="selectedRecipe">
                        <div class="modal-header">
                            <div class="flex-1 min-w-0">
                                <h2 class="mb-2 modal-title">{{ selectedRecipe.name }}</h2>
                                <div class="flex flex-wrap gap-1.5">
                                    <span class="category-badges">{{
                                        selectedRecipe.category
                                    }}</span>
                                    <span
                                        :class="['status-badges',
                                            getStatusClass(selectedRecipe.status ?? 'pending'),
                                        ]"
                                        >{{ statusText(selectedRecipe.status ?? 'pending') }}</span
                                    >
                                </div>
                            </div>
                            <button
                                @click="closeDetailModal"
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
                        <div class="flex overflow-y-auto flex-col flex-1 gap-5 modal-body">
                            <div class="flex flex-col gap-1.5 py-3 px-4 rounded-lg bg-background">
                                <div class="flex gap-2 text-sm">
                                    <span class="w-24 font-semibold text-textSecondary shrink-0"
                                        >Oleh</span
                                    >
                                    <span class="text-textPrimary">{{
                                        selectedRecipe.creator_username ?? 'Unknown'
                                    }}</span>
                                </div>
                                <div class="flex gap-2 text-sm">
                                    <span class="w-24 font-semibold text-textSecondary shrink-0"
                                        >Dibuat</span
                                    >
                                    <span class="text-textPrimary">{{
                                        formatDate(selectedRecipe.created_at)
                                    }}</span>
                                </div>
                                <div
                                    v-if="
                                        selectedRecipe.status !== 'pending' &&
                                        selectedRecipe.reviewer_username
                                    "
                                    class="flex gap-2 text-sm"
                                >
                                    <span class="w-24 font-semibold text-textSecondary shrink-0"
                                        >Direview oleh</span
                                    >
                                    <span class="text-textPrimary">
                                        {{ selectedRecipe.reviewer_username }}
                                        <span
                                            v-if="selectedRecipe.reviewed_at"
                                            class="text-textSecondary"
                                        >
                                            — {{ formatDate(selectedRecipe.reviewed_at) }}</span
                                        >
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
                                <div
                                    v-if="Array.isArray(selectedRecipe.ingredients)"
                                    class="flex flex-col gap-1"
                                >
                                    <p
                                        v-for="(ing, idx) in selectedRecipe.ingredients"
                                        :key="idx"
                                        class="text-sm text-textSecondary"
                                    >
                                        • {{ formatIngredient(ing) }}
                                    </p>
                                </div>
                                <p
                                    v-else
                                    class="text-sm leading-relaxed whitespace-pre-line text-textSecondary"
                                >
                                    {{ selectedRecipe.ingredients }}
                                </p>
                            </div>
                            <div v-if="selectedRecipe.instructions">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Instruksi</p>
                                <p
                                    class="text-sm leading-relaxed whitespace-pre-line text-textSecondary"
                                >
                                    {{ selectedRecipe.instructions }}
                                </p>
                            </div>
                            <div
                                v-if="
                                    selectedRecipe.status === 'rejected' &&
                                    selectedRecipe.rejection_reason
                                "
                                class="alert-box alert-error"
                            >
                                <p
                                    class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error"
                                >
                                    Alasan Penolakan
                                </p>
                                <p class="text-sm text-error">
                                    {{ selectedRecipe.rejection_reason }}
                                </p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <template v-if="selectedRecipe.status === 'pending'">
                                <button
                                    @click="
                                        openApproveModal(selectedRecipe.id, selectedRecipe.name);
                                        closeDetailModal();
                                    "
                                    class="hover:opacity-80 button bg-successSoft text-success"
                                >
                                    Setujui
                                </button>
                                <button
                                    @click="
                                        openRejectModal(selectedRecipe.id, selectedRecipe.name);
                                        closeDetailModal();
                                    "
                                    class="hover:opacity-80 button bg-warningSoft text-warning"
                                >
                                    Tolak
                                </button>
                            </template>
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
            <div v-if="showApproveModal" class="modal-backdrop" @click.self="cancelApprove">
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Setujui Resep</h2>
                        <button @click="cancelApprove" class="modal-close-btn">
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
                            Setujui resep
                            <strong class="text-textPrimary">{{ pendingActionName }}</strong
                            >? Resep akan langsung tampil ke publik.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="cancelApprove"
                            :disabled="actionLoading"
                            class="button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmApprove"
                            :disabled="actionLoading"
                            class="text-white disabled:opacity-50 disabled:cursor-not-allowed button bg-success hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Setujui' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showRejectModal" class="modal-backdrop" @click.self="cancelReject">
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Tolak Resep</h2>
                        <button @click="cancelReject" class="modal-close-btn">
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
                        <p class="mb-3 text-sm text-textSecondary">
                            Tolak resep
                            <strong class="text-textPrimary">{{ pendingActionName }}</strong
                            >?
                        </p>
                        <label class="block mb-1.5 text-sm font-semibold text-textSecondary"
                            >Alasan penolakan (opsional)</label
                        >
                        <textarea
                            v-model="rejectReason"
                            rows="3"
                            placeholder="Tulis alasan penolakan untuk dikirim ke pemilik resep..."
                            class="py-2 px-3 w-full text-sm rounded-lg border resize-none focus:ring-2 focus:outline-none border-border bg-background text-textPrimary placeholder-textMuted focus:ring-primary"
                        />
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="cancelReject"
                            :disabled="actionLoading"
                            class="button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmReject"
                            :disabled="actionLoading"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-error text-textInverse hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Tolak' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showDeleteModal" class="modal-backdrop" @click.self="cancelDelete">
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Hapus Resep</h2>
                        <button @click="cancelDelete" class="modal-close-btn">
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
                class="flex fixed top-5 right-5 gap-3 items-start py-3 px-4 w-80 rounded-xl border shadow-lg border-success/30 bg-successSoft text-success z-60 max-w-[calc(100vw-40px)]"
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
