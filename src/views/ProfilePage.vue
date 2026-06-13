<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/recipeUtils';

const authStore = useAuthStore();

const tabs = [
    { id: 'info', name: 'Info Profil' },
    { id: 'settings', name: 'Pengaturan Akun' },
];

const profile = ref<any>(null);
const activeTab = ref('info');

const newUsername = ref('');
const usernameLoading = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordLoading = ref(false);

const showSuccessToast = ref(false);
const successMessage = ref('');

const isAdmin = computed(() => authStore.isAdmin);

function getRoleBadgeClass(roleId: number) {
    if (roleId === 1) return 'bg-errorSoft text-error';
    return 'bg-primarySoft text-primary';
}

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

onMounted(async () => {
    await loadProfile();
});

async function loadProfile() {
    try {
        const response = await api.profile.showProfile();
        profile.value = response.data;
        newUsername.value = profile.value.username;
    } catch (error: any) {
        alert(error.message || 'Gagal mendapatkan data profil');
    }
}

async function handleUpdateUsername() {
    if (!newUsername.value || newUsername.value.trim().length < 3) {
        alert('Username minimal 3 huruf');
        return;
    }
    usernameLoading.value = true;
    try {
        await api.profile.updateProfile(newUsername.value.trim());
        showSuccess('Username berhasil diubah!');
        await loadProfile();
    } catch (err: any) {
        alert(err.message || 'Gagal mengubah username');
    } finally {
        usernameLoading.value = false;
    }
}

async function handleUpdatePassword() {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        alert('Masukan semua kolom password yang ada!');
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        alert('Password tidak cocok!');
        return;
    }
    if (newPassword.value.length < 6) {
        alert('Password minimal 6 huruf!');
        return;
    }
    passwordLoading.value = true;
    try {
        await api.profile.updatePassword(currentPassword.value, newPassword.value);
        showSuccess('Password berhasil diubah!');
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (err: any) {
        alert(err.message || 'Gagal mengubah password');
    } finally {
        passwordLoading.value = false;
    }
}
</script>

<template>
    <div class="container-body">
        <h1 class="mb-1 card-title">Profil Saya</h1>

        <div class="border-b border-divider">
            <nav class="flex gap-8 -mb-px">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="['border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                        activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'text-textSecondary hover:border-border hover:text-textPrimary border-transparent',
                    ]"
                >
                    {{ tab.name }}
                </button>
            </nav>
        </div>

        <div v-if="!profile" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-show="activeTab === 'info'" class="flex flex-col gap-5">
                <div class="flex gap-6 items-start card max-sm:flex-col max-sm:items-center">
                    <div
                        class="flex justify-center items-center w-24 h-24 rounded-full bg-primary shrink-0"
                    >
                        <span class="text-4xl font-bold text-textInverse">
                            {{ profile.username?.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <div class="flex-1 max-sm:text-center">
                        <h2 class="mb-2 text-3xl font-bold text-textPrimary">
                            {{ profile.username }}
                        </h2>
                        <span :class="['role-badges text-sm', getRoleBadgeClass(profile.role_id)]">
                            {{ profile.role_name }}
                        </span>
                        <p class="mt-4 text-sm text-textSecondary">
                            Bergabung: {{ formatDate(profile.created_at) }}
                        </p>
                    </div>
                </div>

                <div
                    v-if="isAdmin"
                    class="py-3 px-4 rounded-xl border border-warning/30 bg-warningSoft"
                >
                    <p class="text-sm font-semibold text-center text-warning">
                        Anda adalah admin dengan akses penuh ke sistem. Lihat statistik lengkap di
                        <RouterLink to="/admin" class="underline">Dashboard</RouterLink>.
                    </p>
                </div>

                <div v-else class="card">
                    <p class="card-title">Statistik Resep</p>
                    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-textPrimary">
                                {{ profile.recipe_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">
                                Total Resep
                            </div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-success">
                                {{ profile.approved_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Disetujui</div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-error">
                                {{ profile.rejected_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Ditolak</div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-warning">
                                {{ profile.pending_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">
                                Menunggu Review
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'settings'" class="flex flex-col gap-5">
                <div class="card">
                    <p class="text-xl card-title">Ubah Username</p>
                    <div class="max-w-md">
                        <label class="block mb-2 text-sm font-medium text-textPrimary"
                            >Username</label
                        >
                        <input
                            v-model="newUsername"
                            type="text"
                            placeholder="Masukan username baru"
                            class="mb-4 input-field"
                        />
                        <button
                            @click="handleUpdateUsername"
                            :disabled="usernameLoading"
                            class="disabled:opacity-50 button bg-primary text-textInverse hover:bg-primaryPressed"
                        >
                            {{ usernameLoading ? 'Mohon Tunggu...' : 'Ubah Username' }}
                        </button>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-xl card-title">Ubah Password</h3>
                    <div class="space-y-4 max-w-md">
                        <div>
                            <label class="block mb-2 text-sm font-medium text-textPrimary"
                                >Password Sekarang</label
                            >
                            <input
                                v-model="currentPassword"
                                type="password"
                                placeholder="Masukan password sekarang"
                                class="input-field"
                            />
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-textPrimary"
                                >Password Baru</label
                            >
                            <input
                                v-model="newPassword"
                                type="password"
                                placeholder="Masukan password baru"
                                class="input-field"
                            />
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-textPrimary"
                                >Konfirmasi Password Baru</label
                            >
                            <input
                                v-model="confirmPassword"
                                type="password"
                                placeholder="Konfirmasi password baru"
                                class="input-field"
                            />
                        </div>
                        <button
                            @click="handleUpdatePassword"
                            :disabled="passwordLoading"
                            class="disabled:opacity-50 button bg-primary text-textInverse hover:bg-primaryPressed"
                        >
                            {{ passwordLoading ? 'Mohon Tunggu...' : 'Ubah Password' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <teleport to="body">
            <div v-if="showSuccessToast" class="toast">
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
