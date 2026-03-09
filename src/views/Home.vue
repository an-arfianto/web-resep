<template>
    <div class="container py-8 px-4 mx-auto max-w-7xl">
        <div class="mb-12 text-center">
            <h1 class="mb-4 text-4xl font-bold md:text-5xl text-textPrimary">Resep App</h1>
            <p class="mb-8 text-xl text-textSecondary">Pencarian resep masakan menggunakan Boolean Retrieval</p>
            <RouterLink
                to="/search"
                class="inline-block button bg-primary text-textInverse hover:bg-primarySoft hover:text-primary"
            >
                Cari Resep
            </RouterLink>
        </div>

        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-textPrimary">Resep Terbaru</h2>

            <div v-if="recipeStore.loading" class="py-12 text-center">
                <div class="loading-spin"></div>
            </div>

            <div v-else-if="recipeStore.error" class="py-12 text-center">
                <p class="text-error">{{ recipeStore.error }}</p>
            </div>

            <div v-else>
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <RecipeCard v-for="recipe in paginatedRecipes" :key="recipe.id" :recipe="recipe" />
                </div>

                <Pagination
                    v-if="recipeStore.recipes.length > 0"
                    :current-page="currentPage"
                    :total-items="recipeStore.recipes.length"
                    :items-per-page="itemsPerPage"
                    @page-change="handlePageChange"
                />

                <div v-if="recipeStore.recipes.length === 0" class="py-12 text-center">
                    <p class="mt-4 text-lg font-medium text-textPrimary">Tidak ada resep</p>
                    <p class="mt-2 text-sm text-textSecondary">Belum ada resep yang disetujui.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import RecipeCard from '@/components/RecipeCard.vue';
import Pagination from '@/components/Pagination.vue';

const recipeStore = useRecipeStore();
const currentPage = ref(1);
const itemsPerPage = 15;

const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return recipeStore.recipes.slice(start, end);
});

onMounted(() => {
    recipeStore.fetchAllRecipes();
});

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
