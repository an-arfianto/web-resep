<template>
    <div class="flex flex-col gap-5 py-6 px-5 mx-auto max-w-6xl">
        <h1 class="text-2xl font-extrabold text-textPrimary">Profil Saya</h1>

        <!-- Tabs -->
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

        <!-- Loading -->
        <div v-if="!profile" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <div v-show="activeTab === 'info'" class="flex flex-col gap-5">
                <div class="flex gap-6 items-start card max-sm:flex-col max-sm:items-center">
                    <div class="flex justify-center items-center w-24 h-24 rounded-full bg-primary shrink-0">
                        <span class="text-4xl font-bold text-textInverse">
                            {{ profile.username?.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <div class="flex-1 max-sm:text-center">
                        <h2 class="mb-2 text-3xl font-bold text-textPrimary">{{ profile.username }}</h2>
                        <span :class="['role-badges text-sm', getRoleBadgeClass(profile.role_id)]">
                            {{ profile.role_name }}
                        </span>
                        <p class="mt-4 text-sm text-textSecondary">Bergabung: {{ formatDate(profile.created_at) }}</p>
                    </div>
                </div>

                <div v-if="isAdmin" class="py-3 px-4 rounded-xl border border-warning/30 bg-warningSoft">
                    <p class="text-sm font-semibold text-center text-warning">
                        Anda adalah admin dengan akses penuh ke sistem
                    </p>
                </div>

                <template v-if="isModerator">
                    <div class="card">
                        <h3 class="mb-4 text-lg font-bold text-textPrimary">Aktivitas Moderasi</h3>
                        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-primary">{{ profile.reviewed_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Total Review</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-success">{{ profile.approved_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Saya Setujui</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-error">{{ profile.rejected_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Saya Tolak</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-warning">{{ profile.pending_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Pending Review</div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="mb-4 text-lg font-bold text-textPrimary">Resep Saya</h3>
                        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-textPrimary">
                                    {{ profile.my_recipe_count || 0 }}
                                </div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Total Dibuat</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-success">{{ profile.my_approved_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Disetujui</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-error">{{ profile.my_rejected_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Ditolak</div>
                            </div>
                            <div class="p-6 text-center rounded-xl bg-overlay">
                                <div class="text-3xl font-bold text-warning">{{ profile.my_pending_count || 0 }}</div>
                                <div class="mt-2 text-sm font-medium text-textSecondary">Menunggu Review</div>
                            </div>
                        </div>
                    </div>
                </template>

                <div v-if="isRegularUser" class="card">
                    <h3 class="mb-4 text-lg font-bold text-textPrimary">Statistik Resep</h3>
                    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-textPrimary">{{ profile.recipe_count || 0 }}</div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Total Resep</div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-success">{{ profile.approved_count || 0 }}</div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Disetujui</div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-error">{{ profile.rejected_count || 0 }}</div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Ditolak</div>
                        </div>
                        <div class="p-6 text-center rounded-xl bg-overlay">
                            <div class="text-3xl font-bold text-warning">{{ profile.pending_count || 0 }}</div>
                            <div class="mt-2 text-sm font-medium text-textSecondary">Menunggu Review</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'settings'" class="flex flex-col gap-5">
                <div class="card">
                    <h3 class="mb-4 text-lg font-bold text-textPrimary">Ubah Username</h3>
                    <div class="max-w-md">
                        <label class="block mb-2 text-sm font-medium text-textPrimary">Username</label>
                        <input
                            v-model="newUsername"
                            type="text"
                            placeholder="Masukkan username baru"
                            class="mb-4 input-field"
                        />
                        <button
                            @click="handleUpdateUsername"
                            :disabled="usernameLoading"
                            class="transition-colors disabled:opacity-50 disabled:cursor-not-allowed button bg-primary text-textInverse hover:bg-primaryPressed"
                        >
                            {{ usernameLoading ? 'Mohon Tunggu...' : 'Ubah Username' }}
                        </button>
                    </div>
                </div>

                <div class="card">
                    <h3 class="mb-4 text-lg font-bold text-textPrimary">Ubah Password</h3>
                    <div class="space-y-4 max-w-md">
                        <div>
                            <label class="block mb-2 text-sm font-medium text-textPrimary">Password Sekarang</label>
                            <input
                                v-model="currentPassword"
                                type="password"
                                placeholder="Masukkan password sekarang"
                                class="input-field"
                            />
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-textPrimary">Password Baru</label>
                            <input
                                v-model="newPassword"
                                type="password"
                                placeholder="Masukkan password baru"
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
                            class="transition-colors disabled:opacity-50 disabled:cursor-not-allowed button bg-primary text-textInverse hover:bg-primaryPressed"
                        >
                            {{ passwordLoading ? 'Mohon Tunggu...' : 'Ubah Password' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <teleport to="body">
            <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                leave-active-class="transition duration-200 ease-in"
                leave-to-class="opacity-0 translate-y-1"
            >
                <div
                    v-if="showSuccessToast"
                    class="flex fixed right-5 bottom-5 gap-3 items-start py-3 px-4 rounded-xl border shadow-lg border-success/30 bg-successSoft text-success z-60 w-[320px] max-w-[calc(100vw-40px)]"
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
            </transition>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const tabs = [
    { id: 'info', name: 'Info Profil' },
    { id: 'settings', name: 'Pengaturan Akun' },
];

const profile = ref<any>(null);
const activeTab = ref('info');

// Username form
const newUsername = ref('');
const usernameLoading = ref(false);

// Password form
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordLoading = ref(false);

// Success toast
const showSuccessToast = ref(false);
const successMessage = ref('');

const isAdmin = computed(() => profile.value?.role_id === 1);
const isModerator = computed(() => profile.value?.role_id === 2);
const isRegularUser = computed(() => profile.value?.role_id === 3);

onMounted(async () => {
    await loadProfile();
});

async function loadProfile() {
    try {
        const response = await api.profile.getProfile();
        profile.value = response.data;
        newUsername.value = profile.value.username;
    } catch (error: any) {
        alert(error.message || 'Gagal mendapatkan data profil');
    }
}

function getRoleBadgeClass(roleId: number) {
    if (roleId === 1) return 'bg-red-100 text-red-700';
    if (roleId === 2) return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
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
        alert('Isi semua kolom password yang ada!');
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
