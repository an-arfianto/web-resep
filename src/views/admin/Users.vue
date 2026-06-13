<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import Pagination from '@/components/Pagination.vue';
import type { User } from '@/types';
import { formatDate } from '@/utils/recipeUtils';

const users = ref<User[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;

const sortColumn = ref<string>('created_at');
const sortDirection = ref<'asc' | 'desc'>('desc');

const sortedUsers = computed(() => {
    const sorted = [...users.value];
    sorted.sort((a, b) => {
        let aVal = (a as any)[sortColumn.value];
        let bVal = (b as any)[sortColumn.value];
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

const showSuspendModal = ref(false);
const showUnsuspendModal = ref(false);
const showDeleteModal = ref(false);
const pendingUser = ref<User | null>(null);
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

function openSuspendModal(user: User) {
    pendingUser.value = user;
    showSuspendModal.value = true;
}
function openUnsuspendModal(user: User) {
    pendingUser.value = user;
    showUnsuspendModal.value = true;
}
function openDeleteModal(user: User) {
    pendingUser.value = user;
    deleteConfirmed.value = false;
    showDeleteModal.value = true;
}

function cancelSuspend() {
    showSuspendModal.value = false;
    pendingUser.value = null;
}
function cancelUnsuspend() {
    showUnsuspendModal.value = false;
    pendingUser.value = null;
}
function cancelDelete() {
    showDeleteModal.value = false;
    pendingUser.value = null;
    deleteConfirmed.value = false;
}

onMounted(() => {
    showUsers();
});

async function showUsers() {
    try {
        loading.value = true;
        const response = await api.admin.showAllUsers();
        users.value = response.data as User[];
    } catch (err) {
        console.error(err);
        alert('Gagal memuat data user');
    } finally {
        loading.value = false;
    }
}

async function confirmSuspend() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        await api.admin.suspendUser(pendingUser.value.id);
        const target = users.value.find((u) => u.id === pendingUser.value!.id);
        if (target) target.is_suspended = true;
        showSuccess(`${pendingUser.value.username} berhasil disuspend.`);
    } catch (err: any) {
        alert('Gagal suspend user: ' + err.message);
    } finally {
        actionLoading.value = false;
        cancelSuspend();
    }
}

async function confirmUnsuspend() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        await api.admin.unsuspendUser(pendingUser.value.id);
        const target = users.value.find((u) => u.id === pendingUser.value!.id);
        if (target) target.is_suspended = false;
        showSuccess(`${pendingUser.value.username} berhasil di-unsuspend.`);
    } catch (err: any) {
        alert('Gagal unsuspend user: ' + err.message);
    } finally {
        actionLoading.value = false;
        cancelUnsuspend();
    }
}

async function confirmDelete() {
    if (!pendingUser.value) return;
    actionLoading.value = true;
    try {
        await api.admin.deleteUser(pendingUser.value.id);
        users.value = users.value.filter((u) => u.id !== pendingUser.value!.id);
        if (paginatedUsers.value.length === 0 && currentPage.value > 1) currentPage.value--;
        showSuccess(`User "${pendingUser.value.username}" berhasil dihapus.`);
    } catch (err: any) {
        alert('Gagal menghapus user: ' + err.message);
    } finally {
        actionLoading.value = false;
        cancelDelete();
    }
}

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
    <div class="container-body">
        <div>
            <h1 class="section-title">Kelola User</h1>
            <p class="section-subtitle">{{ users.length }} total user terdaftar</p>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-if="users.length === 0" class="flex flex-col gap-2 items-center py-20">
                <p class="text-base font-bold text-textPrimary">Tidak ada user</p>
            </div>

            <div v-else class="overflow-hidden rounded-xl border border-border bg-surface">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-divider bg-background">
                                <th
                                    class="py-3 px-4 font-semibold text-left cursor-pointer text-textSecondary hover:text-textPrimary"
                                    @click="sortBy('username')"
                                >
                                    Username
                                    <span v-if="sortColumn === 'username'">{{
                                        sortDirection === 'asc' ? '↑' : '↓'
                                    }}</span>
                                </th>
                                <th class="py-3 px-4 font-semibold text-left text-textSecondary">
                                    Role
                                </th>
                                <th
                                    class="py-3 px-4 font-semibold text-left cursor-pointer text-textSecondary hover:text-textPrimary"
                                    @click="sortBy('is_suspended')"
                                >
                                    Status
                                </th>
                                <th
                                    class="py-3 px-4 font-semibold text-left cursor-pointer text-textSecondary hover:text-textPrimary"
                                    @click="sortBy('recipe_count')"
                                >
                                    Resep
                                    <span v-if="sortColumn === 'recipe_count'">{{
                                        sortDirection === 'asc' ? '↑' : '↓'
                                    }}</span>
                                </th>
                                <th
                                    class="py-3 px-4 font-semibold text-left cursor-pointer text-textSecondary hover:text-textPrimary"
                                    @click="sortBy('created_at')"
                                >
                                    Bergabung
                                    <span v-if="sortColumn === 'created_at'">{{
                                        sortDirection === 'asc' ? '↑' : '↓'
                                    }}</span>
                                </th>
                                <th class="py-3 px-4 font-semibold text-right text-textSecondary">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-divider">
                            <tr
                                v-for="user in paginatedUsers"
                                :key="user.id"
                                class="transition-colors hover:bg-overlay/20"
                            >
                                <td class="py-3 px-4 font-medium text-textPrimary">
                                    {{ user.username }}
                                </td>
                                <td class="py-3 px-4">
                                    <span
                                        :class="['status-badges',
                                            user.role_id === 1
                                                ? 'bg-errorSoft text-error'
                                                : 'bg-primarySoft text-primary',
                                        ]"
                                    >
                                        {{
                                            user.role_name ??
                                            (user.role_id === 1 ? 'admin' : 'user')
                                        }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <span
                                        :class="['status-badges',
                                            user.is_suspended
                                                ? 'bg-errorSoft text-error'
                                                : 'bg-successSoft text-success',
                                        ]"
                                    >
                                        {{ user.is_suspended ? 'Disuspend' : 'Aktif' }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-textSecondary">
                                    {{ user.recipe_count ?? 0 }}
                                </td>
                                <td class="py-3 px-4 text-textSecondary">
                                    {{ user.created_at ? formatDate(user.created_at) : '-' }}
                                </td>
                                <td class="py-3 px-4">
                                    <div class="flex gap-2 justify-end" v-if="user.role_id !== 1">
                                        <button
                                            v-if="!user.is_suspended"
                                            @click="openSuspendModal(user)"
                                            class="hover:opacity-80 button bg-warningSoft text-warning"
                                        >
                                            Suspend
                                        </button>
                                        <button
                                            v-else
                                            @click="openUnsuspendModal(user)"
                                            class="hover:opacity-80 button bg-successSoft text-success"
                                        >
                                            Aktifkan
                                        </button>
                                        <button
                                            @click="openDeleteModal(user)"
                                            class="hover:opacity-80 button bg-errorSoft text-error"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                    <span v-else class="text-xs text-textMuted">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                v-if="users.length > itemsPerPage"
                :total-items="sortedUsers.length"
                :items-per-page="itemsPerPage"
                :current-page="currentPage"
                @page-change="handlePageChange"
            />
        </template>

        <teleport to="body">
            <div
                v-if="showSuspendModal && pendingUser"
                class="modal-backdrop"
                @click.self="cancelSuspend"
            >
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Suspend User</h2>
                        <button @click="cancelSuspend" class="modal-close-btn">
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
                        <p class="modal-text">
                            <b>{{ pendingUser.username }}</b> tidak akan bisa login sampai
                            di-unsuspend dan semua resep yang telah disetujui akan kembali ke status
                            <b>PENDING</b>.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="cancelSuspend"
                            :disabled="actionLoading"
                            class="button bg-overlay text-textSecondary hover:bg-divider"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmSuspend"
                            :disabled="actionLoading"
                            class="hover:opacity-80 button text-textInverse bg-warning"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Suspend' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div
                v-if="showUnsuspendModal && pendingUser"
                class="modal-backdrop"
                @click.self="cancelUnsuspend"
            >
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-text">Aktifkan User</h2>
                        <button @click="cancelUnsuspend" class="modal-close-btn">
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
                        <p class="modal-text">
                            Aktifkan kembali akun
                            <strong class="text-textPrimary">{{ pendingUser.username }}</strong
                            >?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="cancelUnsuspend"
                            :disabled="actionLoading"
                            class="button bg-overlay text-textSecondary hover:bg-divider"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmUnsuspend"
                            :disabled="actionLoading"
                            class="hover:opacity-80 button text-textInverse bg-success"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Aktifkan' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div
                v-if="showDeleteModal && pendingUser"
                class="modal-backdrop"
                @click.self="cancelDelete"
            >
                <div class="max-w-md modal-panel">
                    <div class="modal-header">
                        <h2 class="modal-title">Hapus User</h2>
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
                    <div class="py-5 px-6">
                        <p class="modal-text">
                            Anda yakin ingin menghapus user
                            <b>{{ pendingUser.username }}</b
                            >?
                        </p>
                        <div
                            v-if="(pendingUser.recipe_count ?? 0) > 0"
                            class="my-3 text-sm alert-box"
                        >
                            <p class="mb-1 font-bold">PERHATIAN</p>
                            <p>
                                Tindakan ini juga akan
                                <b>MENGHAPUS {{ pendingUser.recipe_count }} resep</b> yang dibuat
                                oleh user ini!
                            </p>
                        </div>
                        <label
                            v-if="(pendingUser.recipe_count ?? 0) > 0"
                            class="flex gap-2 items-center cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                v-model="deleteConfirmed"
                                class="w-4 h-4 rounded cursor-pointer focus:ring-2 border-border text-error focus:ring-error"
                            />
                            <span class="text-sm text-textPrimary"
                                >Saya mengerti dan ingin melanjutkan</span
                            >
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button
                            @click="cancelDelete"
                            :disabled="actionLoading"
                            class="button bg-overlay text-textSecondary hover:bg-divider"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="
                                actionLoading ||
                                ((pendingUser.recipe_count ?? 0) > 0 && !deleteConfirmed)
                            "
                            class="hover:opacity-80 disabled:opacity-50 button text-textInverse bg-error"
                        >
                            {{ actionLoading ? 'Menghapus...' : 'Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <teleport to="body">
            <div v-if="showSuccessToast" class="fixed top-5 right-5 toast">
                <p class="toast-text">{{ successMessage }}</p>
                <button @click="showSuccessToast = false" class="toast-close-btn">
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
