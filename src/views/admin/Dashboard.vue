<template>
    <div class="flex flex-col gap-5 py-6 px-5 mx-auto max-w-[1100px]">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else>
            <!-- ── Stats Bar ──────────────────────────────────────── -->
            <div class="flex overflow-hidden rounded-2xl shadow-sm bg-surface">
                <!-- Total User -->
                <div class="flex flex-1 gap-3.5 items-center py-5 px-5">
                    <div
                        class="flex justify-center items-center w-11 h-11 text-blue-600 bg-blue-50 rounded-xl shrink-0"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            width="20"
                            height="20"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-0.5 font-extrabold leading-none text-textPrimary text-[1.75rem]">
                            {{ stats?.totalUsers || 0 }}
                        </p>
                        <p class="font-semibold tracking-widest uppercase text-textSecondary text-[0.7rem]">
                            Total User
                        </p>
                    </div>
                </div>

                <div class="my-3.5 w-px bg-divider"></div>

                <!-- Total Resep -->
                <div class="flex flex-1 gap-3.5 items-center py-5 px-5">
                    <div
                        class="flex justify-center items-center w-11 h-11 text-green-600 bg-green-50 rounded-xl shrink-0"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            width="20"
                            height="20"
                        >
                            <path
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-0.5 font-extrabold leading-none text-textPrimary text-[1.75rem]">
                            {{ stats?.totalRecipes || 0 }}
                        </p>
                        <p class="font-semibold tracking-widest uppercase text-textSecondary text-[0.7rem]">
                            Total Resep
                        </p>
                    </div>
                </div>

                <div class="my-3.5 w-px bg-divider"></div>

                <!-- Kategori -->
                <div class="flex flex-1 gap-3.5 items-center py-5 px-5">
                    <div
                        class="flex justify-center items-center w-11 h-11 text-purple-600 bg-purple-50 rounded-xl shrink-0"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            width="20"
                            height="20"
                        >
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-0.5 font-extrabold leading-none text-textPrimary text-[1.75rem]">
                            {{ stats?.recipesByCategory?.length || 0 }}
                        </p>
                        <p class="font-semibold tracking-widest uppercase text-textSecondary text-[0.7rem]">Kategori</p>
                    </div>
                </div>
            </div>

            <!-- ── Main Layout ────────────────────────────────────── -->
            <div class="flex gap-5 items-start">
                <!-- Sidebar — sticky on desktop, horizontal strip on mobile -->
                <nav
                    class="flex sticky top-5 flex-col gap-0.5 p-2 rounded-2xl shadow-sm bg-surface max-md:sticky-none w-[215px] shrink-0 max-md:top-auto max-md:w-full max-md:flex-row"
                >
                    <p
                        class="px-3 pt-1 pb-2 font-bold uppercase text-textMuted text-[0.68rem] tracking-[0.08em] max-md:hidden"
                    >
                        Menu Admin
                    </p>
                    <RouterLink
                        to="/admin/users"
                        class="flex gap-2.5 items-center py-2.5 px-3 text-sm font-medium no-underline rounded-lg transition-colors text-textSecondary max-md:flex-1 max-md:flex-col max-md:items-center max-md:gap-1 max-md:py-2.5 max-md:text-center max-md:text-[0.72rem] hover:bg-overlay hover:text-textPrimary"
                        :class="{ 'bg-overlay !text-primary !font-bold': $route.path === '/admin/users' }"
                    >
                        <svg
                            class="h-[17px] w-[17px] shrink-0 max-md:h-5 max-md:w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Kelola User</span>
                    </RouterLink>
                    <RouterLink
                        to="/admin/recipes"
                        class="flex gap-2.5 items-center py-2.5 px-3 text-sm font-medium no-underline rounded-lg transition-colors text-textSecondary max-md:flex-1 max-md:flex-col max-md:items-center max-md:gap-1 max-md:py-2.5 max-md:text-center max-md:text-[0.72rem] hover:bg-overlay hover:text-textPrimary"
                        :class="{ 'bg-overlay !text-primary !font-bold': $route.path === '/admin/recipes' }"
                    >
                        <svg
                            class="h-[17px] w-[17px] shrink-0 max-md:h-5 max-md:w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <span>Kelola Resep</span>
                    </RouterLink>
                </nav>

                <!-- Content panel -->
                <section class="flex-1 p-6 min-w-0 rounded-2xl shadow-sm bg-surface max-md:p-4">
                    <div class="pb-4 mb-5 border-b border-divider">
                        <h2 class="mb-0.5 text-lg font-bold text-textPrimary">Resep per Kategori</h2>
                        <p class="text-xs text-textSecondary">Distribusi resep berdasarkan kategori</p>
                    </div>

                    <div v-if="stats?.recipesByCategory?.length" class="flex flex-col gap-2.5">
                        <div
                            v-for="(cat, index) in stats.recipesByCategory"
                            :key="cat.category"
                            class="flex gap-3 items-center"
                        >
                            <!-- Rank + name -->
                            <div class="flex gap-2 items-center w-[180px] shrink-0 max-md:w-[130px]">
                                <span
                                    class="flex justify-center items-center font-bold rounded-full bg-overlay text-textSecondary h-[22px] w-[22px] shrink-0 text-[0.7rem]"
                                >
                                    {{ index + 1 }}
                                </span>
                                <span
                                    class="overflow-hidden text-sm font-medium whitespace-nowrap text-textPrimary text-ellipsis"
                                >
                                    {{ cat.category }}
                                </span>
                            </div>
                            <!-- Bar track -->
                            <div class="overflow-hidden flex-1 h-2 rounded-full bg-overlay">
                                <div
                                    class="h-full rounded-full duration-500 bg-primary transition-[width]"
                                    :style="{ width: barWidth(cat.count) }"
                                ></div>
                            </div>
                            <!-- Count -->
                            <span class="w-7 text-sm font-bold text-right text-textPrimary shrink-0">{{
                                cat.count
                            }}</span>
                        </div>
                    </div>

                    <div v-else class="py-10 text-sm text-center text-textSecondary">Belum ada data kategori.</div>
                </section>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const stats = ref<any>(null);
const loading = ref(true);
const $route = useRoute();

const maxCategoryCount = computed(() => {
    if (!stats.value?.recipesByCategory?.length) return 1;
    return Math.max(...stats.value.recipesByCategory.map((c: any) => c.count));
});

function barWidth(count: number): string {
    const pct = Math.round((count / maxCategoryCount.value) * 100);
    return `${Math.max(pct, 4)}%`;
}

onMounted(async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
        });
        stats.value = response.data.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
});
</script>
