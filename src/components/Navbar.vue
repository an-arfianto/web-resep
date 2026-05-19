<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const dropdownRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

onMounted(() => {
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

function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
    isMobileMenuOpen.value = false;
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
    closeMobileMenu();
    authStore.logout();
    router.push('/login');
}
</script>

<template>
    <nav class="sticky top-0 z-50 border-b bg-surface border-divider shadow-xs">
        <div class="container px-4 mx-auto">
            <div class="flex justify-between items-center h-14">
                <RouterLink to="/" class="text-2xl font-bold text-textPrimary">
                    🍳 Resep App
                </RouterLink>

                <div class="hidden items-center space-x-6 lg:flex">
                    <template v-if="authStore.isAuthenticated">
                        <template v-if="authStore.isAdmin">
                            <RouterLink to="/admin" class="nav-link">Dashboard</RouterLink>
                            <RouterLink to="/admin/users" class="nav-link">User</RouterLink>
                            <RouterLink to="/admin/recipes" class="nav-link">Resep</RouterLink>
                        </template>

                        <template v-else>
                            <RouterLink to="/" class="nav-link">Home</RouterLink>
                            <RouterLink to="/search" class="nav-link">Pencarian</RouterLink>
                            <RouterLink to="/my-recipes" class="nav-link">Resep Saya</RouterLink>
                            <RouterLink to="/create-recipe" class="nav-link">Buat Resep</RouterLink>
                        </template>

                        <div class="relative" ref="dropdownRef">
                            <button @click="toggleDropdown" class="dropdown">
                                <div
                                    class="flex justify-center items-center w-8 h-8 text-white rounded-full bg-primary"
                                >
                                    <span class="text-sm font-bold">{{ getUserInitial() }}</span>
                                </div>
                                <span>{{ authStore.user?.username }}</span>
                                <svg
                                    :class="['h-4 w-4 transition-transform',
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

                            <div
                                v-if="isDropdownOpen"
                                class="absolute right-0 z-10 mt-2 w-56 rounded-lg border shadow-lg bg-surface border-border"
                            >
                                <div class="py-3 px-4 border-b border-border">
                                    <p class="text-sm font-medium text-textPrimary">
                                        {{ authStore.user?.username }}
                                    </p>
                                    <p class="mt-1 text-xs">
                                        <span
                                            v-if="authStore.isAdmin"
                                            class="text-error bg-errorSoft role-badges"
                                            >Admin</span
                                        >
                                        <span v-else class="text-primary bg-primarySoft role-badges"
                                            >User</span
                                        >
                                    </p>
                                </div>

                                <div class="py-1">
                                    <RouterLink
                                        to="/profile"
                                        @click="closeDropdown"
                                        class="dropdown-nav-link"
                                    >
                                        Profil Saya
                                    </RouterLink>
                                    <RouterLink
                                        v-if="!authStore.isAdmin"
                                        to="/my-recipes"
                                        @click="closeDropdown"
                                        class="dropdown-nav-link"
                                    >
                                        Resep Saya
                                    </RouterLink>
                                    <RouterLink
                                        v-if="authStore.isAdmin"
                                        to="/admin"
                                        @click="closeDropdown"
                                        class="dropdown-nav-link"
                                    >
                                        Dashboard
                                    </RouterLink>
                                </div>

                                <div class="pt-1 border-t border-divider">
                                    <button
                                        @click="handleLogout"
                                        class="dropdown-nav-link text-error hover:bg-errorSoft"
                                    >
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <button
                    v-if="authStore.isAuthenticated"
                    @click="toggleMobileMenu"
                    class="flex justify-center items-center w-10 h-10 rounded-lg lg:hidden text-textPrimary bg-overlay hover:bg-primarySoft"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            v-if="!isMobileMenuOpen"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <div
                v-if="isMobileMenuOpen && authStore.isAuthenticated"
                class="pb-4 border-t lg:hidden border-divider"
            >
                <div class="py-3 px-4 border-b bg-surface border-divider">
                    <div class="flex items-center space-x-3">
                        <div
                            class="flex justify-center items-center w-10 h-10 rounded-full text-textInverse bg-primary"
                        >
                            <span class="text-sm font-bold">{{ getUserInitial() }}</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-textPrimary">
                                {{ authStore.user?.username }}
                            </p>
                            <p class="mt-1 text-xs">
                                <span
                                    v-if="authStore.isAdmin"
                                    class="role-badges text-error bg-errorSoft"
                                    >Admin</span
                                >
                                <span v-else class="role-badges text-primary bg-primarySoft"
                                    >User</span
                                >
                            </p>
                        </div>
                    </div>
                </div>

                <div class="py-2">
                    <template v-if="authStore.isAdmin">
                        <RouterLink to="/admin" @click="closeMobileMenu" class="mobile-nav-link"
                            >Dashboard</RouterLink
                        >
                        <RouterLink
                            to="/admin/users"
                            @click="closeMobileMenu"
                            class="mobile-nav-link"
                            >User</RouterLink
                        >
                        <RouterLink
                            to="/admin/recipes"
                            @click="closeMobileMenu"
                            class="mobile-nav-link"
                            >Resep</RouterLink
                        >
                    </template>

                    <template v-else>
                        <RouterLink to="/" @click="closeMobileMenu" class="mobile-nav-link"
                            >Home</RouterLink
                        >
                        <RouterLink to="/search" @click="closeMobileMenu" class="mobile-nav-link"
                            >Pencarian</RouterLink
                        >
                        <RouterLink
                            to="/my-recipes"
                            @click="closeMobileMenu"
                            class="mobile-nav-link"
                            >Resep Saya</RouterLink
                        >
                        <RouterLink
                            to="/create-recipe"
                            @click="closeMobileMenu"
                            class="mobile-nav-link"
                            >Buat Resep</RouterLink
                        >
                    </template>

                    <div class="pt-2 mt-2 border-t border-divider">
                        <RouterLink to="/profile" @click="closeMobileMenu" class="mobile-nav-link"
                            >Profil Saya</RouterLink
                        >
                        <button @click="handleLogout" class="text-error mobile-nav-link">
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
