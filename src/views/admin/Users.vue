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

        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-if="users.length === 0" class="flex flex-col gap-2 items-center py-20">
                <p class="text-base font-bold text-textPrimary">Tidak ada user</p>
            </div>

            <div v-else class="overflow-hidden rounded-2xl border border-border bg-surface">
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
                                <th
                                    class="py-3 px-4 font-semibold text-left cursor-pointer text-textSecondary hover:text-textPrimary"
                                    @click="sortBy('role_name')"
                                >
                                    Role
                                    <span v-if="sortColumn === 'role_name'">{{
                                        sortDirection === 'asc' ? '↑' : '↓'
                                    }}</span>
                                </th>
                                <th class="py-3 px-4 font-semibold text-left text-textSecondary">
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
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-divider">
                            <tr
                                v-for="user in paginatedUsers"
                                :key="user.id"
                                class="transition-colors hover:bg-overlay/40"
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
                                            class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-warningSoft text-warning"
                                        >
                                            Suspend
                                        </button>
                                        <button
                                            v-else
                                            @click="openUnsuspendModal(user)"
                                            class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-successSoft text-success"
                                        >
                                            Aktifkan
                                        </button>
                                        <button
                                            @click="openDeleteModal(user)"
                                            class="py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors hover:opacity-80 bg-errorSoft text-error"
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
                :total="sortedUsers.length"
                :per-page="itemsPerPage"
                :current-page="currentPage"
                @page-change="handlePageChange"
            />
        </template>

        <!-- Suspend Modal -->
        <teleport to="body">
            <div
                v-if="showSuspendModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelSuspend"
            >
                <div
                    class="flex overflow-hidden flex-col w-full max-w-md rounded-2xl shadow-2xl bg-surface"
                >
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Suspend User</h2>
                        <button
                            @click="cancelSuspend"
                            class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary hover:bg-overlay hover:text-textPrimary"
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
                            Suspend
                            <strong class="text-textPrimary">{{ pendingUser.username }}</strong
                            >? User tidak akan bisa login sampai di-unsuspend.
                        </p>
                    </div>
                    <div
                        class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background"
                    >
                        <button
                            @click="cancelSuspend"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmSuspend"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-50 bg-warning hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Suspend' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Unsuspend Modal -->
        <teleport to="body">
            <div
                v-if="showUnsuspendModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelUnsuspend"
            >
                <div
                    class="flex overflow-hidden flex-col w-full max-w-md rounded-2xl shadow-2xl bg-surface"
                >
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Aktifkan User</h2>
                        <button
                            @click="cancelUnsuspend"
                            class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary hover:bg-overlay hover:text-textPrimary"
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
                            Aktifkan kembali akun
                            <strong class="text-textPrimary">{{ pendingUser.username }}</strong
                            >?
                        </p>
                    </div>
                    <div
                        class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background"
                    >
                        <button
                            @click="cancelUnsuspend"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmUnsuspend"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-50 bg-success hover:opacity-85"
                        >
                            {{ actionLoading ? 'Memproses...' : 'Ya, Aktifkan' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Delete Modal -->
        <teleport to="body">
            <div
                v-if="showDeleteModal && pendingUser"
                class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                style="background: rgba(0, 0, 0, 0.45)"
                @click.self="cancelDelete"
            >
                <div
                    class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl bg-surface max-w-115"
                >
                    <div
                        class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                    >
                        <h2 class="text-base font-bold text-textPrimary">Hapus User</h2>
                        <button
                            @click="cancelDelete"
                            class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary hover:bg-overlay hover:text-textPrimary"
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
                            v-if="(pendingUser.recipe_count ?? 0) > 0"
                            class="py-3 px-4 rounded-lg border-error bg-errorSoft border-l-[3px]"
                        >
                            <p class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error">
                                PERHATIAN
                            </p>
                            <p class="text-sm text-error">
                                Tindakan ini juga akan
                                <strong>MENGHAPUS {{ pendingUser.recipe_count }} resep</strong> yang
                                dibuat oleh user ini!
                            </p>
                        </div>
                        <label
                            v-if="(pendingUser.recipe_count ?? 0) > 0"
                            class="flex gap-2 items-center mt-3 cursor-pointer"
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
                    <div
                        class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background"
                    >
                        <button
                            @click="cancelDelete"
                            :disabled="actionLoading"
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                        >
                            Batal
                        </button>
                        <button
                            @click="confirmDelete"
                            :disabled="
                                actionLoading ||
                                ((pendingUser.recipe_count ?? 0) > 0 && !deleteConfirmed)
                            "
                            class="py-2 px-5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-error text-textInverse hover:opacity-85"
                        >
                            {{ actionLoading ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Success Toast -->
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
