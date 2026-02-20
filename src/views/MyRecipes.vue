<template>
    <div>
        <div class="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
            <h1 class="text-2xl font-bold sm:text-3xl text-textPrimary">Resep Saya</h1>
            <RouterLink
                to="/create-recipe"
                class="button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
            >
                + Tambah Resep
            </RouterLink>
        </div>

        <div v-if="recipeStore.loading" class="py-12 text-center">
            <div class="loading-spin"></div>
        </div>

        <div v-else-if="recipeStore.error" class="py-12 text-center">
            <p class="text-error">{{ recipeStore.error }}</p>
        </div>

        <div v-else-if="myRecipes.length > 0">
            <!-- Status Filter - Responsive -->
            <div class="flex flex-wrap gap-2 mb-6">
                <button
                    @click="filterStatus = 'all'"
                    :class="['rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm',
                        filterStatus === 'all'
                            ? 'bg-primary text-textInverse'
                            : 'bg-overlay text-textPrimary hover:bg-primarySoft',
                    ]"
                >
                    Semua ({{ myRecipes.length }})
                </button>
                <button
                    @click="filterStatus = 'approved'"
                    :class="['rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm',
                        filterStatus === 'approved'
                            ? 'bg-primary text-textInverse'
                            : 'bg-overlay text-textPrimary hover:bg-primarySoft',
                    ]"
                >
                    Disetujui ({{ approvedCount }})
                </button>
                <button
                    @click="filterStatus = 'pending'"
                    :class="['rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm',
                        filterStatus === 'pending'
                            ? 'bg-primary text-textInverse'
                            : 'bg-overlay text-textPrimary hover:bg-primarySoft',
                    ]"
                >
                    Pending ({{ pendingCount }})
                </button>
                <button
                    @click="filterStatus = 'rejected'"
                    :class="['rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm',
                        filterStatus === 'rejected'
                            ? 'bg-primary text-textInverse'
                            : 'bg-overlay text-textPrimary hover:bg-primarySoft',
                    ]"
                >
                    Ditolak ({{ rejectedCount }})
                </button>
            </div>

            <!-- Recipes Grid -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <RecipeCardWithStatus v-for="recipe in filteredRecipes" :key="recipe.id" :recipe="recipe" />
            </div>
        </div>

        <div v-else class="py-12 text-center">
            <p class="mb-4 text-lg text-textPrimary">Anda belum membuat resep.</p>
            <RouterLink
                to="/create-recipe"
                class="button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
            >
                Buat resep untuk pertama kali
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import RecipeCardWithStatus from '@/components/RecipeCardWithStatus.vue';
import type { Recipe } from '@/types';

const recipeStore = useRecipeStore();

const filterStatus = ref<'all' | 'approved' | 'pending' | 'rejected'>('all');

const myRecipes = computed<Recipe[]>(() => {
    return recipeStore.myRecipes;
});

const filteredRecipes = computed(() => {
    if (filterStatus.value === 'all') return myRecipes.value;
    return myRecipes.value.filter((r) => r.status === filterStatus.value);
});

const approvedCount = computed(() => myRecipes.value.filter((r) => r.status === 'approved').length);
const pendingCount = computed(() => myRecipes.value.filter((r) => r.status === 'pending').length);
const rejectedCount = computed(() => myRecipes.value.filter((r) => r.status === 'rejected').length);

onMounted(async () => {
    await recipeStore.fetchMyRecipes();
    console.log('My recipes:', recipeStore.myRecipes);
});
</script>
