<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import type { AdminStats } from '@/types';

const $route = useRoute();
const stats = ref<AdminStats | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const maxCategoryCount = computed(() =>
    stats.value?.recipesByCategory?.length
        ? Math.max(...stats.value.recipesByCategory.map((c) => c.count))
        : 1
);

const maxRoleCount = computed(() =>
    stats.value?.usersByRole?.length ? Math.max(...stats.value.usersByRole.map((r) => r.count)) : 1
);

function categoryBarWidth(count: number): string {
    return `${Math.max(Math.round((count / maxCategoryCount.value) * 100), 4)}%`;
}

function roleBarWidth(count: number): string {
    return `${Math.max(Math.round((count / maxRoleCount.value) * 100), 4)}%`;
}

// Only 2 roles now: admin and user
const roleBadge: Record<string, string> = {
    admin: 'bg-errorSoft text-error',
    user: 'bg-primarySoft text-primary',
};

const roleBar: Record<string, string> = {
    admin: 'bg-error',
    user: 'bg-primary',
};

function getRoleBadgeClass(roleName: string): string {
    return roleBadge[roleName] ?? 'bg-overlay text-textSecondary';
}

function getRoleBarClass(roleName: string): string {
    return roleBar[roleName] ?? 'bg-primary';
}

onMounted(async () => {
    try {
        const response = await api.admin.showStats();
        stats.value = response.data;
    } catch (err: unknown) {
        error.value =
            typeof err === 'object' && err !== null && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Gagal memuat statistik';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="flex flex-col gap-5 py-6 px-4 mx-auto w-full max-w-6xl lg:px-6">
        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="error" class="flex justify-center py-20">
            <p class="text-sm text-error">{{ error }}</p>
        </div>

        <template v-else>
            <div
                class="grid overflow-hidden grid-cols-1 gap-px rounded-2xl shadow-sm lg:flex lg:grid-cols-4 lg:gap-0 bg-divider"
            >
                <div class="stat-card">
                    <p class="stat-value">{{ stats?.totalUsers ?? 0 }}</p>
                    <p class="stat-label">Total User</p>
                </div>
                <div class="hidden my-3 w-px lg:block bg-divider"></div>
                <div class="stat-card">
                    <p class="stat-value text-error">{{ stats?.suspendedUsers ?? 0 }}</p>
                    <p class="stat-label">Disuspend</p>
                </div>
                <div class="hidden my-3 w-px lg:block bg-divider"></div>
                <div class="stat-card">
                    <p class="stat-value">{{ stats?.totalRecipes ?? 0 }}</p>
                    <p class="stat-label">Total Resep</p>
                </div>
                <div class="hidden my-3 w-px lg:block bg-divider"></div>
                <div class="stat-card">
                    <p class="stat-value">{{ stats?.recipesByCategory?.length ?? 0 }}</p>
                    <p class="stat-label">Kategori</p>
                </div>
            </div>

            <!-- Recipe status stats -->
            <div
                class="grid overflow-hidden grid-cols-1 gap-px rounded-2xl shadow-sm lg:grid-cols-3 bg-divider"
            >
                <div class="stat-card">
                    <p class="stat-value text-warning">
                        {{ stats?.recipesByStatus?.pending ?? 0 }}
                    </p>
                    <p class="stat-label">Pending Review</p>
                </div>
                <div class="stat-card">
                    <p class="stat-value text-success">
                        {{ stats?.recipesByStatus?.approved ?? 0 }}
                    </p>
                    <p class="stat-label">Disetujui</p>
                </div>
                <div class="stat-card">
                    <p class="stat-value text-error">{{ stats?.recipesByStatus?.rejected ?? 0 }}</p>
                    <p class="stat-label">Ditolak</p>
                </div>
            </div>

            <div class="flex flex-col gap-5 lg:flex-row lg:items-start">
                <nav
                    class="flex flex-row gap-1 p-2 rounded-2xl shadow-sm lg:sticky lg:top-20 lg:flex-col lg:w-52 bg-surface lg:shrink-0"
                >
                    <p
                        class="hidden px-3 pt-1 pb-2 text-xs font-bold tracking-widest uppercase lg:block text-textMuted"
                    >
                        Menu Admin
                    </p>
                    <RouterLink
                        to="/admin/users"
                        class="flex flex-col flex-1 gap-1 items-center py-2.5 px-3 text-xs font-medium no-underline rounded-lg transition-colors lg:flex-row lg:gap-2.5 lg:items-center lg:text-sm text-textSecondary hover:bg-overlay hover:text-textPrimary"
                        :class="{
                            'bg-overlay text-primary! font-bold!': $route.path === '/admin/users',
                        }"
                    >
                        <span class="text-center lg:text-left">Kelola User</span>
                    </RouterLink>
                    <RouterLink
                        to="/admin/recipes"
                        class="flex flex-col flex-1 gap-1 items-center py-2.5 px-3 text-xs font-medium no-underline rounded-lg transition-colors lg:flex-row lg:gap-2.5 lg:items-center lg:text-sm text-textSecondary hover:bg-overlay hover:text-textPrimary"
                        :class="{
                            'bg-overlay text-primary! font-bold!': $route.path === '/admin/recipes',
                        }"
                    >
                        <span class="text-center lg:text-left">Kelola Resep</span>
                    </RouterLink>
                </nav>

                <div class="flex flex-col flex-1 gap-5 w-full min-w-0">
                    <section class="card">
                        <div class="section-header">
                            <h2 class="section-title">Resep per Kategori</h2>
                            <p class="section-subtitle">Distribusi resep berdasarkan kategori</p>
                        </div>
                        <div v-if="stats?.recipesByCategory?.length" class="flex flex-col gap-2.5">
                            <div
                                v-for="(cat, index) in stats.recipesByCategory"
                                :key="cat.category"
                                class="flex gap-3 items-center"
                            >
                                <div class="flex gap-2 items-center w-40 lg:w-48 shrink-0">
                                    <span class="rank-badge">{{ index + 1 }}</span>
                                    <span
                                        class="overflow-hidden text-sm font-medium whitespace-nowrap text-textPrimary text-ellipsis"
                                    >
                                        {{ cat.category }}
                                    </span>
                                </div>
                                <div class="overflow-hidden flex-1 h-2 rounded-full bg-overlay">
                                    <div
                                        class="h-full rounded-full duration-500 bg-primary transition-[width]"
                                        :style="{ width: categoryBarWidth(cat.count) }"
                                    />
                                </div>
                                <span
                                    class="w-7 text-sm font-bold text-right text-textPrimary shrink-0"
                                >
                                    {{ cat.count }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="py-10 text-sm text-center text-textSecondary">
                            Belum ada data kategori.
                        </div>
                    </section>

                    <section class="card">
                        <div class="section-header">
                            <h2 class="section-title">Distribusi User</h2>
                            <p class="section-subtitle">Pengguna berdasarkan role</p>
                        </div>
                        <div v-if="stats?.usersByRole?.length" class="flex flex-col gap-2.5">
                            <div
                                v-for="(role, index) in stats.usersByRole"
                                :key="role.role_name"
                                class="flex gap-3 items-center"
                            >
                                <div class="flex gap-2 items-center w-32 lg:w-40 shrink-0">
                                    <span class="rank-badge">{{ index + 1 }}</span>
                                    <span
                                        class="overflow-hidden text-sm font-medium whitespace-nowrap text-textPrimary text-ellipsis"
                                    >
                                        {{ role.role_name }}
                                    </span>
                                </div>
                                <div class="overflow-hidden flex-1 h-2 rounded-full bg-overlay">
                                    <div
                                        class="h-full rounded-full duration-500 transition-[width]"
                                        :class="getRoleBarClass(role.role_name)"
                                        :style="{ width: roleBarWidth(role.count) }"
                                    />
                                </div>
                                <span
                                    class="w-7 text-sm font-bold text-right text-textPrimary shrink-0"
                                >
                                    {{ role.count }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="py-10 text-sm text-center text-textSecondary">
                            Belum ada data user.
                        </div>
                    </section>
                </div>
            </div>
        </template>
    </div>
</template>
