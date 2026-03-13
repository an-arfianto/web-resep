<template>
    <div class="flex flex-col gap-5 py-6 px-4 mx-auto w-full max-w-6xl lg:px-6">
        <div class="grid overflow-hidden grid-cols-2 gap-px rounded-2xl shadow-sm lg:flex lg:gap-0 bg-divider">
            <div class="stat-card">
                <div>
                    <p class="stat-value">{{ moderationStore.stats.total }}</p>
                    <p class="stat-label">Total Resep</p>
                </div>
            </div>
            <div class="hidden my-3.5 w-px lg:block bg-divider"></div>
            <div class="stat-card">
                <div>
                    <p class="stat-value text-warning">{{ moderationStore.stats.pending }}</p>
                    <p class="stat-label">Pending</p>
                </div>
            </div>
            <div class="hidden my-3.5 w-px lg:block bg-divider"></div>
            <div class="stat-card">
                <div>
                    <p class="stat-value text-success">{{ moderationStore.stats.approved }}</p>
                    <p class="stat-label">Disetujui</p>
                </div>
            </div>
            <div class="hidden my-3.5 w-px lg:block bg-divider"></div>
            <div class="stat-card">
                <div>
                    <p class="stat-value text-error">{{ moderationStore.stats.rejected }}</p>
                    <p class="stat-label">Ditolak</p>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
            <nav
                class="flex flex-row gap-1 p-2 rounded-2xl shadow-sm lg:sticky lg:top-20 lg:flex-col lg:w-52 bg-surface lg:shrink-0"
            >
                <p class="px-3 pt-1 pb-2 text-xs font-bold tracking-widest uppercase text-textMuted max-lg:hidden">
                    Menu Moderasi
                </p>
                <button
                    v-for="nav in navItems"
                    :key="nav.key"
                    @click="handleTabChange(nav.key)"
                    :class="['flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                        'lg:flex-row lg:items-center lg:gap-2.5 lg:py-2.5 lg:text-sm',
                        activeTab === nav.key
                            ? 'bg-overlay text-primary font-bold'
                            : 'text-textSecondary hover:bg-overlay hover:text-textPrimary',
                    ]"
                >
                    <span class="leading-tight text-center lg:text-left">{{ nav.label }}</span>
                    <span
                        v-if="nav.key === 'pending' && moderationStore.stats.pending > 0"
                        class="lg:ml-auto notification-number"
                    >
                        {{ moderationStore.stats.pending }}
                    </span>
                </button>
            </nav>

            <section class="flex-1 w-full min-w-0 card">
                <div v-if="moderationStore.loading" class="flex justify-center py-16">
                    <div class="loading-spin"></div>
                </div>

                <div v-else-if="moderationStore.error" class="flex flex-col gap-3 items-center py-16">
                    <p class="text-sm text-error">{{ moderationStore.error }}</p>
                    <button @click="moderationStore.fetchStats()" class="button bg-error text-textInverse">
                        Coba lagi
                    </button>
                </div>

                <template v-else>
                    <div class="py-4 px-4 section-header">
                        <h2 class="section-title">{{ currentNav?.label }}</h2>
                        <p class="section-subtitle">{{ panelSubtitle }}</p>
                    </div>

                    <div class="p-4">
                        <template v-if="activeTab === 'pending'">
                            <div
                                v-if="moderationStore.pendingRecipes.length === 0"
                                class="flex flex-col gap-2 items-center"
                            >
                                <p class="font-bold text-textPrimary">Semua sudah direview</p>
                                <p class="text-sm text-textSecondary">Tidak ada resep pending sementara waktu.</p>
                            </div>
                            <div v-else class="flex flex-col gap-3">
                                <PendingRecipeItem
                                    v-for="recipe in paginatedPendingRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @approve="handleApprove"
                                    @reject="handleReject"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="moderationStore.pendingRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPagePending"
                                :total-items="moderationStore.pendingRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangePending"
                            />
                        </template>

                        <template v-else-if="activeTab === 'reviewed'">
                            <div v-if="loadingReviewed" class="flex justify-center py-14">
                                <div class="loading-spin"></div>
                            </div>
                            <div v-else-if="reviewedRecipes.length === 0" class="flex flex-col gap-2 items-center">
                                <p class="font-bold text-textPrimary">Belum ada review</p>
                                <p class="text-sm text-textSecondary">Anda belum mereview resep apapun.</p>
                            </div>
                            <div v-else class="flex flex-col gap-3">
                                <ReviewedRecipeItem
                                    v-for="recipe in paginatedReviewedRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="reviewedRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPageReviewed"
                                :total-items="reviewedRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangeReviewed"
                            />
                        </template>

                        <template v-else-if="activeTab === 'all'">
                            <div v-if="loadingAll" class="flex justify-center py-14">
                                <div class="loading-spin"></div>
                            </div>
                            <div
                                v-else-if="moderationStore.allRecipes.length === 0"
                                class="flex flex-col gap-2 items-center"
                            >
                                <p class="font-bold text-textPrimary">Tidak ada resep</p>
                            </div>
                            <div v-else class="flex flex-col gap-3">
                                <ReviewedRecipeItem
                                    v-for="recipe in paginatedAllRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="moderationStore.allRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPageAll"
                                :total-items="moderationStore.allRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangeAll"
                            />
                        </template>
                    </div>
                </template>
            </section>
        </div>

        <teleport to="body">
            <div v-if="showDetailModal && selectedRecipe" class="modal-backdrop" @click.self="closeDetailModal">
                <div class="modal-panel max-h-[80vh] max-w-160">
                    <div class="modal-header">
                        <div class="flex-1 min-w-0">
                            <h2 class="mb-2 modal-title">{{ selectedRecipe.name }}</h2>
                            <div class="flex flex-wrap gap-1.5">
                                <span class="category-badges">{{ selectedRecipe.category }}</span>
                                <span :class="['status-badges', statusBadgeClass(selectedRecipe.status)]">
                                    {{ getStatusText(selectedRecipe.status) }}
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
                                <span class="w-20 font-semibold text-textSecondary shrink-0">Oleh</span>
                                <span class="text-textPrimary">{{ selectedRecipe.creator_username }}</span>
                            </div>
                            <div class="flex gap-2 text-sm">
                                <span class="w-20 font-semibold text-textSecondary shrink-0">Dibuat</span>
                                <span class="text-textPrimary">{{ formatDate(selectedRecipe.created_at) }}</span>
                            </div>
                            <div v-if="selectedRecipe.reviewed_at" class="flex gap-2 text-sm">
                                <span class="w-20 font-semibold text-textSecondary shrink-0">Direview</span>
                                <span class="text-textPrimary">
                                    {{ formatDate(selectedRecipe.reviewed_at) }}
                                    <span v-if="selectedRecipe.reviewer_username" class="text-textSecondary">
                                        oleh {{ selectedRecipe.reviewer_username }}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div v-if="selectedRecipe.description">
                            <p class="mb-1.5 text-sm font-bold text-textPrimary">Deskripsi</p>
                            <p class="text-sm leading-relaxed text-textSecondary">{{ selectedRecipe.description }}</p>
                        </div>
                        <div v-if="selectedRecipe.ingredients">
                            <p class="mb-1.5 text-sm font-bold text-textPrimary">Bahan-bahan</p>
                            <p class="text-sm leading-relaxed whitespace-pre-line text-textSecondary">
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
                            <p class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error">Alasan Penolakan</p>
                            <p class="text-sm leading-relaxed text-error">{{ selectedRecipe.rejection_reason }}</p>
                        </div>
                    </div>

                    <div v-if="selectedRecipe.status === 'pending'" class="modal-footer">
                        <button
                            @click="handleApproveFromModal(selectedRecipe.id)"
                            :disabled="modalActionLoading"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-successSoft text-success hover:bg-success hover:text-textInverse"
                        >
                            {{ modalActionLoading ? 'Mohon Tunggu...' : 'Setujui' }}
                        </button>
                        <button
                            @click="openRejectModal"
                            :disabled="modalActionLoading"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-errorSoft text-error hover:bg-error hover:text-textInverse"
                        >
                            Tolak
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showRejectModal" class="modal-backdrop" @click.self="closeRejectModal">
                <div class="max-w-md modal-panel">
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
                    <div class="modal-body">
                        <p class="mb-3 text-sm leading-relaxed text-textSecondary">
                            Berikan alasan agar pembuat resep dapat memperbaikinya.
                        </p>
                        <textarea
                            v-model="rejectionReason"
                            rows="5"
                            placeholder="Contoh: Bahan-bahan tidak lengkap, instruksi kurang jelas, dll."
                            :disabled="modalActionLoading"
                            :class="['input-field resize-y text-sm',
                                showRejectError && 'border-error focus:ring-error',
                            ]"
                        ></textarea>
                        <p v-if="showRejectError" class="mt-2 text-xs text-error">Mohon berikan alasan penolakan</p>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="closeRejectModal"
                            :disabled="modalActionLoading"
                            class="font-semibold disabled:opacity-50 button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="handleRejectFromModal"
                            :disabled="modalActionLoading"
                            class="disabled:opacity-50 disabled:cursor-not-allowed button bg-error text-textInverse hover:opacity-85"
                        >
                            {{ modalActionLoading ? 'Mohon Tunggu...' : 'Tolak Resep' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div class="flex fixed right-5 bottom-5 flex-col gap-2 z-60">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    :class="['toast',
                        toast.type === 'error' && 'toast-error',
                        toast.type === 'success' && 'toast-success',
                    ]"
                >
                    <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
                    <button
                        @click="removeToast(toast.id)"
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
            </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useModerationStore } from '@/stores/moderationStore';
import { useAuthStore } from '@/stores/authStore';
import PendingRecipeItem from '@/components/moderation/PendingRecipeItem.vue';
import ReviewedRecipeItem from '@/components/moderation/ReviewedRecipeItem.vue';
import Pagination from '@/components/Pagination.vue';
import type { ModerationRecipe } from '@/types';

const moderationStore = useModerationStore();
const authStore = useAuthStore();

type TabKey = 'pending' | 'reviewed' | 'all';

interface Toast {
    id: number;
    type: 'success' | 'error';
    message: string;
}
const toasts = ref<Toast[]>([]);
let toastId = 0;

function showToast(type: Toast['type'], message: string, duration = 4000) {
    const id = ++toastId;
    toasts.value.push({ id, type, message });
    setTimeout(() => removeToast(id), duration);
}

function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}

// Navigation
const navItems: { key: TabKey; label: string }[] = [
    { key: 'pending', label: 'Review Pending' },
    { key: 'reviewed', label: 'Review Saya' },
    { key: 'all', label: 'Semua Resep' },
];

const activeTab = ref<TabKey>('pending');
const currentNav = computed(() => navItems.find((n) => n.key === activeTab.value));
const panelSubtitle = computed(
    () =>
        ({
            pending: `${moderationStore.pendingRecipes.length} resep menunggu review`,
            reviewed: `${reviewedRecipes.value.length} resep telah Anda review`,
            all: `${moderationStore.allRecipes.length} total resep terdaftar`,
        })[activeTab.value]
);

// Tab cache
const reviewedRecipes = ref<ModerationRecipe[]>([]);
const reviewedLoaded = ref(false);
const loadingReviewed = ref(false);
const allLoaded = ref(false);
const loadingAll = ref(false);

// Modals
const showDetailModal = ref(false);
const showRejectModal = ref(false);
const selectedRecipe = ref<ModerationRecipe | null>(null);
const rejectionReason = ref('');
const showRejectError = ref(false);
const modalActionLoading = ref(false);

// Pagination
const currentPagePending = ref(1);
const currentPageReviewed = ref(1);
const currentPageAll = ref(1);
const itemsPerPage = 10;

const currentUserId = computed(() => authStore.user?.id);

const paginatedPendingRecipes = computed(() => {
    const s = (currentPagePending.value - 1) * itemsPerPage;
    return moderationStore.pendingRecipes.slice(s, s + itemsPerPage);
});
const paginatedReviewedRecipes = computed(() => {
    const s = (currentPageReviewed.value - 1) * itemsPerPage;
    return reviewedRecipes.value.slice(s, s + itemsPerPage);
});
const paginatedAllRecipes = computed(() => {
    const s = (currentPageAll.value - 1) * itemsPerPage;
    return moderationStore.allRecipes.slice(s, s + itemsPerPage);
});

onMounted(async () => {
    await moderationStore.fetchStats();
    await moderationStore.fetchPendingRecipes();
});

async function handleTabChange(tab: TabKey) {
    activeTab.value = tab;
    if (tab === 'reviewed' && !reviewedLoaded.value) {
        loadingReviewed.value = true;
        try {
            await moderationStore.fetchAllRecipes();
            rebuildReviewedCache();
            reviewedLoaded.value = true;
        } finally {
            loadingReviewed.value = false;
        }
    }
    if (tab === 'all' && !allLoaded.value) {
        loadingAll.value = true;
        try {
            await moderationStore.fetchAllRecipes();
            allLoaded.value = true;
        } finally {
            loadingAll.value = false;
        }
    }
}

function rebuildReviewedCache() {
    const uid = Number(currentUserId.value);
    reviewedRecipes.value = moderationStore.allRecipes.filter(
        (r) => Number(r.reviewed_by) === uid && r.status !== 'pending'
    );
}

function openRecipeDetail(recipe: ModerationRecipe) {
    selectedRecipe.value = recipe;
    showDetailModal.value = true;
}
function closeDetailModal() {
    showDetailModal.value = false;
    selectedRecipe.value = null;
}
function openRejectModal() {
    rejectionReason.value = '';
    showRejectError.value = false;
    showRejectModal.value = true;
}
function closeRejectModal() {
    if (modalActionLoading.value) return;
    showRejectModal.value = false;
    rejectionReason.value = '';
    showRejectError.value = false;
}

function invalidateCaches() {
    reviewedLoaded.value = false;
    allLoaded.value = false;
}

async function handleApprove(recipeId: number) {
    try {
        const success = await moderationStore.approveRecipe(recipeId);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil disetujui.');
            if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) currentPagePending.value--;
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menyetujui resep.');
    }
}

async function handleReject(data: { recipeId: number; reason: string }) {
    try {
        const success = await moderationStore.rejectRecipe(data.recipeId, data.reason);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil ditolak.');
            if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) currentPagePending.value--;
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menolak resep.');
    }
}

async function handleApproveFromModal(recipeId: number) {
    modalActionLoading.value = true;
    try {
        const success = await moderationStore.approveRecipe(recipeId);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil disetujui.');
            closeDetailModal();
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menyetujui resep.');
    } finally {
        modalActionLoading.value = false;
    }
}

async function handleRejectFromModal() {
    if (!rejectionReason.value.trim()) {
        showRejectError.value = true;
        return;
    }
    modalActionLoading.value = true;
    try {
        const success = await moderationStore.rejectRecipe(selectedRecipe.value!.id, rejectionReason.value.trim());
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil ditolak.');
            closeRejectModal();
            closeDetailModal();
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menolak resep.');
        closeRejectModal();
    } finally {
        modalActionLoading.value = false;
    }
}

function statusBadgeClass(status: string) {
    return (
        {
            approved: 'bg-successSoft text-success',
            pending: 'bg-warningSoft text-warning',
            rejected: 'bg-errorSoft text-error',
        }[status] ?? 'bg-warningSoft text-warning'
    );
}
function getStatusText(status: string) {
    return { approved: 'Disetujui', pending: 'Pending', rejected: 'Ditolak' }[status] ?? status;
}
function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}
function handlePageChangePending(page: number) {
    currentPagePending.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function handlePageChangeReviewed(page: number) {
    currentPageReviewed.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function handlePageChangeAll(page: number) {
    currentPageAll.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
