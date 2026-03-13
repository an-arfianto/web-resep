<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Pagination from '@/components/Pagination.vue';

const users = ref<any[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;

const sortColumn = ref<string>('created_at');
const sortDirection = ref<'asc' | 'desc'>('desc');

const sortedUsers = computed(() => {
    const sorted = [...users.value];
    sorted.sort((a, b) => {
        let aVal = a[sortColumn.value];
        let bVal = b[sortColumn.value];
        if (aVal === null || aVal === undefined) aVal = 0;
        if (bVal === null || bVal === undefined) bVal = 0;
        if (sortColumn.value === 'created_at') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
});

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return sortedUsers.value.slice(start, start + itemsPerPage);
});

function sortBy(column: string) {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
    currentPage.value = 1;
}

const showPromoteModal = ref(false);
const showDemoteModal = ref(false);
const showDeleteModal = ref(false);
const pendingUser = ref<any>(null);
const actionLoading = ref(false);
const deleteConfirmed = ref(false);

const showSuccessToast = ref(false);
const successMessage = ref('');

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

function openPromoteModal(user: any) {
    pendingUser.value = user;
    showPromoteModal.value = true;
}
function openDemoteModal(user: any) {
    pendingUser.value = user;
    showDemoteModal.value = true;
}
function openDeleteModal(user: any) {
    pendingUser.value = user;
    deleteConfirmed.value = false;
    showDeleteModal.value = true;
}

function cancelPromote() {
    showPromoteModal.value = false;
    pendingUser.value = null;
}
function cancelDemote() {
    showDemoteModal.value = false;
    pendingUser.value = null;
}
function cancelDelete() {
    showDeleteModal.value = false;
    pendingUser.value = null;
    deleteConfirmed.value = false;
}

onMounted(() => {
    fetchUsers();
});

async function fetchUsers() {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        users.value = response.data.data;
    } catch (err) {
        console.error(err);
        alert('Failed to load users');
    } finally {
        loading.value = false;
    }
}

async function confirmPromote() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        await axios.put(
            `/api/admin/users/${pendingUser.value.id}/promote`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchUsers();
        showSuccess(`${pendingUser.value.username} berhasil dipromosikan ke MODERATOR!`);
    } catch (err: any) {
        alert('Gagal mempromosikan user: ' + (err.response?.data?.message || err.message));
    } finally {
        actionLoading.value = false;
        cancelPromote();
    }
}

async function confirmDemote() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        await axios.put(
            `/api/admin/users/${pendingUser.value.id}/demote`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchUsers();
        showSuccess(`${pendingUser.value.username} berhasil diturunkan ke user.`);
    } catch (err: any) {
        alert('Gagal menurunkan user: ' + (err.response?.data?.message || err.message));
    } finally {
        actionLoading.value = false;
        cancelDemote();
    }
}

async function confirmDelete() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/users/${pendingUser.value.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        users.value = users.value.filter((u) => u.id !== pendingUser.value.id);
        if (paginatedUsers.value.length === 0 && currentPage.value > 1) currentPage.value--;
        showSuccess(`User "${pendingUser.value.username}" berhasil dihapus.`);
    } catch (err: any) {
        alert('Gagal menghapus user: ' + (err.response?.data?.message || err.message));
    } finally {
        actionLoading.value = false;
        cancelDelete();
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
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
                <h1 class="mb-0.5 text-2xl font-extrabold text-textPrimary">Kelola User</h1>
                <p class="text-xs text-textSecondary">{{ users.length }} total user terdaftar</p>
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
            <div v-if="users.length === 0" class="flex flex-col gap-2 items-center py-20">
                <p class="text-base font-bold text-textPrimary">Tidak ada user</p>
            </div>

            <div v-else class="overflow-hidden card">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b-2 border-divider">
                                <th class="p-4 text-sm font-semibold text-left text-textPrimary">No</th>
                                <th class="p-4 text-sm font-semibold text-left text-textPrimary">Username</th>
                                <th
                                    @click="sortBy('role_id')"
                                    class="p-4 text-sm font-semibold text-left cursor-pointer select-none text-textPrimary"
                                >
                                    <div class="flex gap-2 items-center">
                                        Role
                                        <span class="text-textMuted">
                                            <span v-if="sortColumn === 'role_id'">{{
                                                sortDirection === 'asc' ? '↑' : '↓'
                                            }}</span>
                                            <span v-else class="opacity-30">↕</span>
                                        </span>
                                    </div>
                                </th>
                                <th class="p-4 text-sm font-semibold text-left text-textPrimary">Resep</th>
                                <th
                                    @click="sortBy('created_at')"
                                    class="p-4 text-sm font-semibold text-left cursor-pointer select-none text-textPrimary"
                                >
                                    <div class="flex gap-2 items-center">
                                        Bergabung
                                        <span class="text-textMuted">
                                            <span v-if="sortColumn === 'created_at'">{{
                                                sortDirection === 'asc' ? '↑' : '↓'
                                            }}</span>
                                            <span v-else class="opacity-30">↕</span>
                                        </span>
                                    </div>
                                </th>
                                <th class="p-4 text-sm font-semibold text-left text-textPrimary">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(user, index) in paginatedUsers"
                                :key="user.id"
                                class="border-b transition-colors border-divider hover:bg-overlay/50"
                            >
                                <td class="p-4 text-sm text-textSecondary">
                                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                                </td>
                                <td class="p-4 font-medium text-textPrimary">{{ user.username }}</td>
                                <td class="p-4">
                                    <span
                                        :class="['role-badges',
                                            user.role_id === 1 && 'bg-errorSoft text-error',
                                            user.role_id === 2 && 'bg-secondarySoft text-secondary',
                                            user.role_id === 3 && 'bg-primarySoft text-primary',
                                        ]"
                                    >
                                        {{ user.role_name }}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span
                                        class="inline-flex items-center py-1 px-3 text-xs font-semibold rounded-full bg-secondarySoft text-secondary"
                                    >
                                        {{ user.recipe_count || 0 }}
                                    </span>
                                </td>
                                <td class="p-4 text-sm text-textSecondary">{{ formatDate(user.created_at) }}</td>
                                <td class="p-4">
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            v-if="user.role_id === 3"
                                            @click="openPromoteModal(user)"
                                            class="py-1.5 px-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                                            title="Promote to Moderator"
                                        >
                                            Promosi
                                        </button>
                                        <button
                                            v-if="user.role_id === 2"
                                            @click="openDemoteModal(user)"
                                            class="py-1.5 px-3 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg transition-colors hover:bg-orange-100"
                                            title="Demote to User"
                                        >
                                            Turun
                                        </button>
                                        <button
                                            v-if="user.role_id !== 1"
                                            @click="openDeleteModal(user)"
                                            class="py-1.5 px-3 text-sm font-medium text-red-700 bg-red-50 rounded-lg transition-colors hover:bg-red-100"
                                            title="Delete User"
                                        >
                                            Hapus
                                        </button>
                                        <span
                                            v-if="user.role_id === 1"
                                            class="py-1.5 px-3 text-sm italic text-textMuted"
                                        >
                                            Protected
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                v-if="users.length > itemsPerPage"
                :current-page="currentPage"
                :total-items="sortedUsers.length"
                :items-per-page="itemsPerPage"
                @page-change="handlePageChange"
            />
        </template>

        <teleport to="body">
            <div
                v-if="showPromoteModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelPromote"
            >
                <div class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-w-105">
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Promosikan User</h2>
                        <button
                            @click="cancelPromote"
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
                    <div class="py-5 px-6">
                        <p class="text-sm leading-relaxed text-textSecondary">
                            Promosikan <strong class="text-textPrimary">{{ pendingUser.username }}</strong> ke role
                            <strong class="text-textPrimary">Moderator</strong>?
                        </p>
                    </div>
                    <div class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background">
                        <button
                            @click="cancelPromote"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmPromote"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold text-white bg-blue-600 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Promosikan' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div
                v-if="showDemoteModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelDemote"
            >
                <div class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-w-105">
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Turunkan User</h2>
                        <button
                            @click="cancelDemote"
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
                    <div class="py-5 px-6">
                        <p class="text-sm leading-relaxed text-textSecondary">
                            Turunkan <strong class="text-textPrimary">{{ pendingUser.username }}</strong> ke role
                            <strong class="text-textPrimary">User</strong>?
                        </p>
                    </div>
                    <div class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background">
                        <button
                            @click="cancelDemote"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDemote"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold text-white bg-orange-600 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Turunkan' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div
                v-if="showDeleteModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelDelete"
            >
                <div class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-w-115">
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Hapus User</h2>
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
                    <div class="py-5 px-6">
                        <p class="mb-3 text-sm leading-relaxed text-textSecondary">
                            Anda yakin ingin menghapus user
                            <strong class="text-textPrimary">{{ pendingUser.username }}</strong
                            >?
                        </p>
                        <div
                            v-if="pendingUser.recipe_count > 0"
                            class="py-3 px-4 rounded-lg border-error bg-errorSoft border-l-[3px]"
                        >
                            <p class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error">PERHATIAN</p>
                            <p class="text-sm text-error">
                                Tindakan ini juga akan
                                <strong>MENGHAPUS {{ pendingUser.recipe_count }} resep</strong> yang dibuat oleh user
                                ini!
                            </p>
                        </div>
                        <p
                            v-if="!deleteConfirmed && pendingUser.recipe_count > 0"
                            class="mt-3 text-xs text-textSecondary"
                        >
                            Centang untuk konfirmasi:
                        </p>
                        <label v-if="pendingUser.recipe_count > 0" class="flex gap-2 items-center mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                v-model="deleteConfirmed"
                                class="w-4 h-4 rounded cursor-pointer focus:ring-2 border-border text-error focus:ring-error"
                            />
                            <span class="text-sm text-textPrimary">Saya mengerti dan ingin melanjutkan</span>
                        </label>
                    </div>
                    <div class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background">
                        <button
                            @click="cancelDelete"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="actionLoading || (pendingUser.recipe_count > 0 && !deleteConfirmed)"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-error text-textInverse hover:opacity-85"
                        >
                            {{ actionLoading ? 'Menghapus...' : 'Ya, Hapus' }}
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
