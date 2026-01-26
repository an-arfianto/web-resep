<template>
    <div class="container py-8 px-4 mx-auto max-w-7xl">
        <h1 class="mb-8 text-3xl font-bold">Moderator Dashboard</h1>

        <!-- Statistics Cards -->
        <div v-if="!moderationStore.loading" class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div class="card">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Total Resep</p>
                        <p class="mt-2 text-3xl font-bold text-gray-900">
                            {{ moderationStore.stats.total }}
                        </p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Resep Pending</p>
                        <p class="mt-2 text-3xl font-bold text-yellow-600">
                            {{ moderationStore.stats.pending }}
                        </p>
                    </div>
                    <div class="p-3 bg-yellow-100 rounded-full">
                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Resep Disetujui</p>
                        <p class="mt-2 text-3xl font-bold text-green-600">
                            {{ moderationStore.stats.approved }}
                        </p>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Resep Ditolak</p>
                        <p class="mt-2 text-3xl font-bold text-red-600">
                            {{ moderationStore.stats.rejected }}
                        </p>
                    </div>
                    <div class="p-3 bg-red-100 rounded-full">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="moderationStore.loading" class="py-12 text-center">
            <div class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="moderationStore.error" class="py-12 text-center">
            <p class="text-red-600">{{ moderationStore.error }}</p>
        </div>

        <!-- Tab Navigation -->
        <div v-else class="card">
            <div class="mb-6 border-b border-gray-200">
                <nav class="flex -mb-px space-x-8">
                    <button
                        @click="setActiveTab('pending')"
                        :class="[
                            activeTab === 'pending'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        ]"
                    >
                        Review Pending
                        <span
                            v-if="moderationStore.stats.pending > 0"
                            class="inline-flex justify-center items-center py-0.5 px-2 ml-2 text-xs font-bold text-white bg-yellow-600 rounded-full"
                        >
                            {{ moderationStore.stats.pending }}
                        </span>
                    </button>
                    <button
                        @click="setActiveTab('reviewed')"
                        :class="[
                            activeTab === 'reviewed'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        ]"
                    >
                        Review Saya
                    </button>
                    <button
                        @click="setActiveTab('all')"
                        :class="[
                            activeTab === 'all'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        ]"
                    >
                        Semua Recipe
                    </button>
                </nav>
            </div>

            <!-- Pending Recipes Tab -->
            <div v-if="activeTab === 'pending'">
                <div v-if="moderationStore.pendingRecipes.length === 0" class="py-12 text-center">
                    <svg class="mx-auto w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="mt-4 text-lg font-medium text-gray-900">Semua sudah direview</p>
                    <p class="mt-2 text-sm text-gray-600">Tidak ada resep pending sementara waktu.</p>
                </div>

                <div v-else class="space-y-4">
                    <PendingRecipeItem
                        v-for="recipe in paginatedPendingRecipes"
                        :key="recipe.id"
                        :recipe="recipe"
                        @approve="handleApprove"
                        @reject="handleReject"
                        @view-detail="openRecipeDetail"
                    />
                </div>

                <!-- Pagination -->
                <Pagination
                    v-if="moderationStore.pendingRecipes.length > 0"
                    :current-page="currentPagePending"
                    :total-items="moderationStore.pendingRecipes.length"
                    :items-per-page="itemsPerPage"
                    @page-change="handlePageChangePending"
                />
            </div>

            <!-- My Reviews Tab -->
            <div v-else-if="activeTab === 'reviewed'">
                <div v-if="loadingReviewed" class="py-12 text-center">
                    <div class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"></div>
                </div>

                <div v-else-if="reviewedRecipes.length === 0" class="py-12 text-center">
                    <svg class="mx-auto w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="mt-4 text-lg font-medium text-gray-900">Tidak ada review</p>
                    <p class="mt-2 text-sm text-gray-600">Anda belum mereview resep.</p>
                </div>

                <div v-else class="space-y-4">
                    <ReviewedRecipeItem
                        v-for="recipe in paginatedReviewedRecipes"
                        :key="recipe.id"
                        :recipe="recipe"
                        @view-detail="openRecipeDetail"
                    />
                </div>

                <!-- Pagination -->
                <Pagination
                    v-if="reviewedRecipes.length > 0"
                    :current-page="currentPageReviewed"
                    :total-items="reviewedRecipes.length"
                    :items-per-page="itemsPerPage"
                    @page-change="handlePageChangeReviewed"
                />
            </div>

            <!-- All Recipes Tab -->
            <div v-else-if="activeTab === 'all'">
                <div v-if="loadingAll" class="py-12 text-center">
                    <div class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"></div>
                </div>

                <div v-else-if="moderationStore.allRecipes.length === 0" class="py-12 text-center">
                    <p class="text-gray-600">Tidak ada resep</p>
                </div>

                <div v-else class="space-y-4">
                    <ReviewedRecipeItem
                        v-for="recipe in paginatedAllRecipes"
                        :key="recipe.id"
                        :recipe="recipe"
                        @view-detail="openRecipeDetail"
                    />
                </div>

                <!-- Pagination -->
                <Pagination
                    v-if="moderationStore.allRecipes.length > 0"
                    :current-page="currentPageAll"
                    :total-items="moderationStore.allRecipes.length"
                    :items-per-page="itemsPerPage"
                    @page-change="handlePageChangeAll"
                />
            </div>
        </div>

        <!-- Recipe Detail Modal -->
        <teleport to="body">
            <div
                v-if="showDetailModal && selectedRecipe"
                class="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeDetailModal"
            >
                <div class="overflow-hidden w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl">
                    <!-- Modal Header -->
                    <div class="flex sticky top-0 z-10 justify-between items-center p-6 bg-white border-b border-gray-200">
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold text-gray-900">{{ selectedRecipe.name }}</h2>
                            <div class="flex gap-2 items-center mt-2">
                                <span class="inline-block py-1 px-3 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                                    {{ selectedRecipe.category }}
                                </span>
                                <span :class="['inline-block py-1 px-3 text-xs font-semibold rounded-full', getStatusBadge(selectedRecipe.status)]">
                                    {{ getStatusText(selectedRecipe.status) }}
                                </span>
                            </div>
                        </div>
                        <button
                            @click="closeDetailModal"
                            class="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-100"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Modal Content -->
                    <div class="overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-200px)]">
                        <!-- Creator Info -->
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="flex gap-4 text-sm text-gray-600">
                                <span><strong>Oleh:</strong> {{ selectedRecipe.creator_username }}</span>
                                <span><strong>Dibuat:</strong> {{ formatDate(selectedRecipe.created_at) }}</span>
                            </div>
                            <div v-if="selectedRecipe.reviewed_at" class="mt-2 text-sm text-gray-600">
                                <strong>Direview:</strong> {{ formatDate(selectedRecipe.reviewed_at) }}
                                <span v-if="selectedRecipe.reviewer_username">
                                    oleh {{ selectedRecipe.reviewer_username }}
                                </span>
                            </div>
                        </div>

                        <!-- Description -->
                        <div v-if="selectedRecipe.description">
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Deskripsi</h3>
                            <p class="text-gray-700 leading-relaxed">{{ selectedRecipe.description }}</p>
                        </div>

                        <!-- Ingredients -->
                        <div v-if="selectedRecipe.ingredients">
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Bahan-bahan</h3>
                            <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p class="text-gray-800 whitespace-pre-line">{{ selectedRecipe.ingredients }}</p>
                            </div>
                        </div>

                        <!-- Instructions -->
                        <div v-if="selectedRecipe.instructions">
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Instruksi</h3>
                            <div class="p-4 bg-green-50 rounded-lg border border-green-100">
                                <p class="text-gray-800 leading-relaxed whitespace-pre-line">{{ selectedRecipe.instructions }}</p>
                            </div>
                        </div>

                        <!-- Rejection Reason -->
                        <div v-if="selectedRecipe.status === 'rejected' && selectedRecipe.rejection_reason" class="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h3 class="mb-2 text-lg font-semibold text-red-900">Alasan Penolakan</h3>
                            <p class="text-red-700">{{ selectedRecipe.rejection_reason }}</p>
                        </div>
                    </div>

                    <!-- Modal Footer - Action Buttons (only for pending recipes) -->
                    <div v-if="selectedRecipe.status === 'pending'" class="flex gap-3 justify-end p-6 bg-gray-50 border-t border-gray-200">
                        <button
                            @click="handleApproveFromModal(selectedRecipe.id)"
                            :disabled="modalActionLoading"
                            class="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            {{ modalActionLoading ? 'Memproses...' : 'Setujui' }}
                        </button>
                        <button
                            @click="openRejectModalFromDetail"
                            :disabled="modalActionLoading"
                            class="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                            Tolak
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Rejection Modal -->
        <teleport to="body">
            <div
                v-if="showRejectModal"
                class="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black/50 backdrop-blur-sm"
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
                        class="input-field mt-4 resize-none"
                        :class="{ 'border-red-300': showRejectError }"
                    ></textarea>
                    <p v-if="showRejectError" class="mt-1 text-xs text-red-600">
                        Mohon berikan alasan penolakan
                    </p>

                    <div class="flex gap-3 justify-end mt-6">
                        <button
                            @click="closeRejectModal"
                            :disabled="modalActionLoading"
                            class="btn-secondary disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            @click="handleRejectFromModal"
                            :disabled="modalActionLoading"
                            class="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                            {{ modalActionLoading ? 'Memproses...' : 'Tolak Resep' }}
                        </button>
                    </div>
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

const activeTab = ref<'pending' | 'reviewed' | 'all'>('pending');
const loadingReviewed = ref(false);
const loadingAll = ref(false);
const reviewedRecipes = ref<any[]>([]);
const showDetailModal = ref(false);
const showRejectModal = ref(false);
const selectedRecipe = ref<ModerationRecipe | null>(null);
const rejectionReason = ref('');
const showRejectError = ref(false);
const modalActionLoading = ref(false);

// Pagination state
const currentPagePending = ref(1);
const currentPageReviewed = ref(1);
const currentPageAll = ref(1);
const itemsPerPage = 10;

const currentUserId = computed(() => authStore.user?.id);

// Pagination data
const paginatedPendingRecipes = computed(() => {
    const start = (currentPagePending.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return moderationStore.pendingRecipes.slice(start, end);
});

const paginatedReviewedRecipes = computed(() => {
    const start = (currentPageReviewed.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return reviewedRecipes.value.slice(start, end);
});

const paginatedAllRecipes = computed(() => {
    const start = (currentPageAll.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return moderationStore.allRecipes.slice(start, end);
});

onMounted(async () => {
    await moderationStore.fetchStats();
    await moderationStore.fetchPendingRecipes();
});

async function loadReviewedRecipes() {
    loadingReviewed.value = true;
    try {
        await moderationStore.fetchAllRecipes();
        const currentUserIdNum = Number(currentUserId.value);
        reviewedRecipes.value = moderationStore.allRecipes.filter(
            (r) => Number(r.reviewed_by) === currentUserIdNum && r.status !== 'pending'
        );
    } finally {
        loadingReviewed.value = false;
    }
}

async function loadAllRecipes() {
    loadingAll.value = true;
    try {
        await moderationStore.fetchAllRecipes();
    } finally {
        loadingAll.value = false;
    }
}

async function handleTabChange(tab: 'pending' | 'reviewed' | 'all') {
    activeTab.value = tab;
    if (tab === 'reviewed') {
        currentPageReviewed.value = 1; // Reset to page 1
        await loadReviewedRecipes();
    } else if (tab === 'all') {
        currentPageAll.value = 1; // Reset to page 1
        await loadAllRecipes();
    }
}

const setActiveTab = (tab: 'pending' | 'reviewed' | 'all') => {
    handleTabChange(tab);
};

function openRecipeDetail(recipe: ModerationRecipe) {
    selectedRecipe.value = recipe;
    showDetailModal.value = true;
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedRecipe.value = null;
}

function openRejectModalFromDetail() {
    showRejectModal.value = true;
}

function closeRejectModal() {
    if (!modalActionLoading.value) {
        showRejectModal.value = false;
        rejectionReason.value = '';
        showRejectError.value = false;
    }
}

async function handleApprove(recipeId: number) {
    const success = await moderationStore.approveRecipe(recipeId);
    if (success) {
        // Reset to page 1 if current page becomes empty
        if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) {
            currentPagePending.value--;
        }
        if (activeTab.value === 'reviewed') {
            await loadReviewedRecipes();
        } else if (activeTab.value === 'all') {
            await loadAllRecipes();
        }
    }
}

async function handleReject(data: { recipeId: number; reason: string }) {
    const success = await moderationStore.rejectRecipe(data.recipeId, data.reason);
    if (success) {
        // Reset to page 1 if current page becomes empty
        if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) {
            currentPagePending.value--;
        }
        if (activeTab.value === 'reviewed') {
            await loadReviewedRecipes();
        } else if (activeTab.value === 'all') {
            await loadAllRecipes();
        }
    }
}

async function handleApproveFromModal(recipeId: number) {
    modalActionLoading.value = true;
    const success = await moderationStore.approveRecipe(recipeId);
    modalActionLoading.value = false;
    
    if (success) {
        closeDetailModal();
        if (activeTab.value === 'reviewed') {
            await loadReviewedRecipes();
        } else if (activeTab.value === 'all') {
            await loadAllRecipes();
        }
    }
}

async function handleRejectFromModal() {
    if (!rejectionReason.value.trim()) {
        showRejectError.value = true;
        return;
    }

    modalActionLoading.value = true;
    const success = await moderationStore.rejectRecipe(
        selectedRecipe.value!.id,
        rejectionReason.value.trim()
    );
    modalActionLoading.value = false;

    if (success) {
        closeRejectModal();
        closeDetailModal();
        if (activeTab.value === 'reviewed') {
            await loadReviewedRecipes();
        } else if (activeTab.value === 'all') {
            await loadAllRecipes();
        }
    }
}

function getStatusBadge(status: string) {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
}

function getStatusText(status: string) {
    if (status === 'approved') return 'Disetujui';
    if (status === 'pending') return 'Pending';
    if (status === 'rejected') return 'Ditolak';
    return status;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Pagination handlers
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
