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
                        <span
                            :class="['status-badges shrink-0',
                                recipe.status === 'approved' && 'bg-successSoft text-success',
                                recipe.status === 'pending' && 'bg-warningSoft text-warning',
                                recipe.status === 'rejected' && 'bg-errorSoft text-error',
                                !['approved', 'pending', 'rejected'].includes(recipe.status) &&
                                    'bg-warningSoft text-warning',
                            ]"
                        >
                            {{ statusText(recipe.status) }}
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-1.5 items-center">
                        <span class="category-badges">{{ recipe.category }}</span>
                        <span class="text-xs text-textMuted">·</span>
                        <span class="inline-flex gap-1 items-center text-xs text-textSecondary">
                            Oleh: {{ recipe.author }}
                        </span>
                    </div>

                    <p v-if="recipe.ingredients" class="flex-1 text-xs leading-relaxed text-textSecondary line-clamp-2">
                        {{ recipe.ingredients }}
                    </p>

                    <div
                        class="flex flex-wrap gap-2 justify-between items-center pt-2.5 mt-auto border-t border-divider"
                    >
                        <span class="text-textMuted text-[0.72rem]">{{ formatDate(recipe.created_at) }}</span>
                        <div class="flex gap-1.5">
                            <RouterLink
                                :to="`/recipe/${recipe.id}`"
                                class="inline-flex gap-1.5 items-center py-1.5 px-3.5 text-xs font-semibold no-underline rounded-lg transition-colors bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                            >
                                Lihat
                            </RouterLink>
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
            <div
                v-if="showDeleteModal"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelDelete"
            >
                <div
                    class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl modal-panel bg-surface max-w-105"
                >
                    <!-- Header -->
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-5 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Hapus Resep</h2>
                        <button
                            @click="cancelDelete"
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
                    <div class="py-5 px-5">
                        <p class="text-sm leading-relaxed text-textSecondary">
                            Anda yakin ingin menghapus resep
                            <strong class="text-textPrimary">{{ pendingDeleteName }}</strong
                            >? Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="flex gap-2.5 justify-end py-3.5 px-5 border-t border-divider bg-background">
                        <button
                            @click="cancelDelete"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="deletingId !== null"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-error text-textInverse hover:opacity-85"
                        >
                            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
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

function statusText(status: string): string {
    return { approved: 'Disetujui', pending: 'Pending', rejected: 'Ditolak' }[status] ?? status;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
