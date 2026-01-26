<template>
    <nav class="border-b border-gray-200 bg-white shadow-md">
        <div class="container mx-auto px-4">
            <div class="flex h-16 items-center justify-between">
                <RouterLink to="/" class="text-primary-600 text-2xl font-bold">
                    🍳 RecipeApp
                </RouterLink>

                <div class="hidden items-center space-x-6 md:flex">
                    <template v-if="authStore.isAuthenticated">
                        <!-- admin links -->
                        <template v-if="isAdmin">
                            <RouterLink to="/admin" class="nav-link">Dashboard</RouterLink>
                            <RouterLink to="/admin/users" class="nav-link">User</RouterLink>
                            <RouterLink to="/admin/recipes" class="nav-link">Resep</RouterLink>
                        </template>

                        <!-- moderator links -->
                        <template v-else-if="isModerator">
                            <RouterLink to="/" class="nav-link">Home</RouterLink>
                            <RouterLink to="/search" class="nav-link">Pencarian</RouterLink>
                            <RouterLink to="/moderation" class="nav-link">
                                Dashboard
                                <span
                                    v-if="pendingCount > 0"
                                    class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                                >
                                    {{ pendingCount }}
                                </span>
                            </RouterLink>
                            <RouterLink to="/my-recipes" class="nav-link">Resep Saya</RouterLink>
                        </template>

                        <!-- user links -->
                        <template v-else>
                            <RouterLink to="/" class="nav-link">Home</RouterLink>
                            <RouterLink to="/search" class="nav-link">Pencarian</RouterLink>
                            <RouterLink to="/my-recipes" class="nav-link">Resep Saya</RouterLink>
                            <RouterLink to="/create-recipe" class="nav-link">Buat Resep</RouterLink>
                        </template>

                        <!-- user dropdown -->
                        <div class="relative" ref="dropdownRef">
                            <button
                                @click="toggleDropdown"
                                class="focus:ring-primary-500 flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:outline-none"
                            >
                                <div
                                    class="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white"
                                >
                                    <span class="text-sm font-bold">
                                        {{ getUserInitial() }}
                                    </span>
                                </div>
                                <span>{{ authStore.user?.username }}</span>
                                <svg
                                    :class="[
                                        'h-4 w-4 transition-transform',
                                        isDropdownOpen && 'rotate-180',
                                    ]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            <!-- dropdown menu -->
                            <transition
                                enter-active-class="transition duration-100 ease-out"
                                enter-from-class="opacity-0 transform scale-95"
                                enter-to-class="opacity-100 transform scale-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="opacity-100 transform scale-100"
                                leave-to-class="opacity-0 transform scale-95"
                            >
                                <div
                                    v-if="isDropdownOpen"
                                    class="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg"
                                >
                                    <!-- User Info Section -->
                                    <div class="border-b border-gray-200 px-4 py-3">
                                        <p class="text-sm font-medium text-gray-900">
                                            {{ authStore.user?.username }}
                                        </p>
                                        <p class="mt-1 text-xs text-gray-500">
                                            <span
                                                v-if="isAdmin"
                                                class="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                                            >
                                                Admin
                                            </span>
                                            <span
                                                v-else-if="isModerator"
                                                class="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
                                            >
                                                Moderator
                                            </span>
                                            <span
                                                v-else
                                                class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
                                            >
                                                User
                                            </span>
                                        </p>
                                    </div>

                                    <!-- menu items -->
                                    <div class="py-1">
                                        <!-- profile -->
                                        <RouterLink
                                            to="/profile"
                                            @click="closeDropdown"
                                            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                        >
                                            <svg
                                                class="mr-3 h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            Profil Saya
                                        </RouterLink>

                                        <!-- link berdasarkan role -->
                                        <RouterLink
                                            v-if="!isAdmin && !isModerator"
                                            to="/my-recipes"
                                            @click="closeDropdown"
                                            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                        >
                                            <svg
                                                class="mr-3 h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            Resep Saya
                                        </RouterLink>

                                        <RouterLink
                                            v-if="isModerator"
                                            to="/moderation"
                                            @click="closeDropdown"
                                            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                        >
                                            <svg
                                                class="mr-3 h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                            Mod Dashboard
                                            <span
                                                v-if="pendingCount > 0"
                                                class="ml-auto inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
                                            >
                                                {{ pendingCount }}
                                            </span>
                                        </RouterLink>

                                        <RouterLink
                                            v-if="isAdmin"
                                            to="/admin"
                                            @click="closeDropdown"
                                            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                        >
                                            <svg
                                                class="mr-3 h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                            </svg>
                                            Admin Dashboard
                                        </RouterLink>
                                    </div>

                                    <!-- Logout Section -->
                                    <div class="border-t border-gray-200 pt-1">
                                        <button
                                            @click="handleLogout"
                                            class="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <svg
                                                class="mr-3 h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useModerationStore } from '@/stores/moderationStore';

const router = useRouter();
const authStore = useAuthStore();
const moderationStore = useModerationStore();
const dropdownRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);

const isAdmin = computed(() => authStore.user?.role_id === 1);
const isModerator = computed(() => authStore.user?.role_id === 3);
const pendingCount = computed(() => moderationStore.stats.pending);

// mendapatkan jumlah resep pending
onMounted(async () => {
    if (isModerator.value || isAdmin.value) {
        await moderationStore.fetchStats();
    }

    // click outside (event listener)
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
    isDropdownOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        closeDropdown();
    }
}

function getUserInitial(): string {
    return authStore.user?.username?.charAt(0).toUpperCase() || 'U';
}

function handleLogout() {
    closeDropdown();
    authStore.logout();
    router.push('/login');
}
</script>
