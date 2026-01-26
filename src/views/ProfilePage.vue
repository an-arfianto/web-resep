<template>
    <div class="container py-8 px-4 mx-auto max-w-6xl">
        <h1 class="mb-8 text-3xl font-bold">My Profile</h1>

        <!-- Tabs Navigation -->
        <div class="mb-6 border-b border-gray-200">
            <nav class="flex -mb-px space-x-8" aria-label="Tabs">
                <button
                    v-for="tab in availableTabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                        activeTab === tab.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                    ]"
                >
                    {{ tab.name }}
                </button>
            </nav>
        </div>

        <!-- Tab Content -->
        <div v-if="profile">
            <!-- Profile Info Tab -->
            <div v-show="activeTab === 'info'" class="space-y-6">
                <!-- User Info Card -->
                <div class="card">
                    <div class="flex gap-6 items-start">
                        <div
                            class="flex flex-shrink-0 justify-center items-center w-24 h-24 rounded-full bg-primary-600"
                        >
                            <span class="text-4xl font-bold text-white">
                                {{ profile.username?.charAt(0).toUpperCase() }}
                            </span>
                        </div>
                        <div class="flex-1">
                            <h2 class="mb-2 text-3xl font-bold">{{ profile.username }}</h2>
                            <span
                                :class="['inline-block rounded-full px-4 py-1.5 text-sm font-semibold',
                                    getRoleBadge(profile.role_id),
                                ]"
                            >
                                {{ profile.role_name }}
                            </span>
                            <p class="mt-4 text-sm text-gray-600">
                                Member since: {{ formatDate(profile.created_at) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="card">
                    <h3 class="mb-6 text-xl font-bold">Statistics</h3>
                    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div class="p-6 text-center bg-blue-50 rounded-xl">
                            <div class="text-3xl font-bold text-blue-600">
                                {{ profile.recipe_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-gray-600">Total Resep</div>
                        </div>
                        <div class="p-6 text-center bg-green-50 rounded-xl">
                            <div class="text-3xl font-bold text-green-600">
                                {{ profile.approved_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-gray-600">
                                {{ isModerator ? 'I Approved' : 'Disetujui' }}
                            </div>
                        </div>
                        <div class="p-6 text-center bg-yellow-50 rounded-xl">
                            <div class="text-3xl font-bold text-yellow-600">
                                {{ profile.pending_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-gray-600">Pending</div>
                        </div>
                        <div class="p-6 text-center bg-red-50 rounded-xl">
                            <div class="text-3xl font-bold text-red-600">
                                {{ profile.rejected_count || 0 }}
                            </div>
                            <div class="mt-2 text-sm font-medium text-gray-600">
                                {{ isModerator ? 'I Rejected' : 'Ditolak' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Account Settings Tab -->
            <div v-show="activeTab === 'settings'" class="space-y-6">
                <!-- Edit Username Card -->
                <div class="card">
                    <h3 class="mb-6 text-xl font-bold">Edit Username</h3>
                    <div class="max-w-md">
                        <label class="block mb-2 text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            v-model="newUsername"
                            type="text"
                            class="mb-4 input-field"
                            placeholder="Username Baru"
                        />
                        <button
                            @click="updateUsername"
                            :disabled="loading"
                            class="disabled:opacity-50 btn-primary"
                        >
                            {{ loading ? 'Mohon Tunggu...' : 'Update Username' }}
                        </button>
                    </div>
                </div>
                <!-- Change Password Card -->
                <div class="card">
                    <h3 class="mb-6 text-xl font-bold">Change Password</h3>
                    <div class="space-y-4 max-w-md">
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                v-model="currentPassword"
                                type="password"
                                class="input-field"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                v-model="newPassword"
                                type="password"
                                class="input-field"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                v-model="confirmPassword"
                                type="password"
                                class="input-field"
                                placeholder="Confirm new password"
                            />
                        </div>
                        <button
                            @click="updatePassword"
                            :disabled="loading"
                            class="disabled:opacity-50 btn-primary"
                        >
                            {{ loading ? 'Mohon Tunggu...' : 'Update Password' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State for Profile -->
        <div v-else class="py-12 text-center">
            <div
                class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"
            ></div>
            <p class="mt-4 text-gray-600">Loading profile...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();

const profile = ref<any>(null);
const activeTab = ref('info');
const newUsername = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const isAdmin = computed(() => profile.value?.role_id === 1);
const isModerator = computed(() => profile.value?.role_id === 3);
const isRegularUser = computed(() => profile.value?.role_id === 2);

const availableTabs = computed(() => {
    return [
        { id: 'info', name: 'Profile Info' },
        { id: 'settings', name: 'Account Settings' },
    ];
});

onMounted(async () => {
    await loadProfile();
});

const loadProfile = async () => {
    try {
        const response = await api.profile.getProfile();
        profile.value = response.data;
        newUsername.value = profile.value.username;
    } catch (error: any) {
        alert(error.message || 'Failed to load profile');
    }
};

const getRoleBadge = (roleId: number) => {
    if (roleId === 1) return 'bg-red-100 text-red-700';
    if (roleId === 3) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
};

const getStatusBadge = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const updateUsername = async () => {
    if (!newUsername.value || newUsername.value.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }
    loading.value = true;
    try {
        await api.profile.updateProfile(newUsername.value);
        alert('Username updated successfully!');
        await loadProfile();
    } catch (err: any) {
        alert(err.message);
    } finally {
        loading.value = false;
    }
};

const updatePassword = async () => {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        alert('Please fill all password fields');
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        alert('Passwords do not match');
        return;
    }
    if (newPassword.value.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    loading.value = true;
    try {
        await api.profile.updatePassword(currentPassword.value, newPassword.value);
        alert('Password updated successfully!');
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (err: any) {
        alert(err.message || 'Failed to update password');
    } finally {
        loading.value = false;
    }
};

const deleteRecipe = async (recipeId: number) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        return;
    }
    try {
        await api.recipes.delete(recipeId);
        alert('Recipe deleted successfully!');
        await loadProfile(); // Reload to update stats
    } catch (err: any) {
        alert(err.message || 'Failed to delete recipe');
    }
};
</script>
