<template>
    <div class="container py-8 px-4 mx-auto max-w-7xl">
        <div class="mb-12 text-center">
            <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Resep App</h1>
            <p class="mb-8 text-xl text-gray-600">
                Pencarian resep masakan menggunakan Boolean Retrieval
            </p>
            <RouterLink to="/search" class="inline-block py-3 px-8 text-lg btn-primary">
                Cari Resep
            </RouterLink>
        </div>

        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Resep Terbaru</h2>

            <div v-if="recipeStore.loading" class="py-12 text-center">
                <div
                    class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"
                ></div>
            </div>

            <div v-else-if="recipeStore.error" class="py-12 text-center">
                <p class="text-red-600">{{ recipeStore.error }}</p>
            </div>

            <div v-else>
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <RecipeCard
                        v-for="recipe in paginatedRecipes"
                        :key="recipe.id"
                        :recipe="recipe"
                    />
                </div>

                <!-- Pagination -->
                <Pagination
                    v-if="recipeStore.recipes.length > 0"
                    :current-page="currentPage"
                    :total-items="recipeStore.recipes.length"
                    :items-per-page="itemsPerPage"
                    @page-change="handlePageChange"
                />

                <div v-if="recipeStore.recipes.length === 0" class="py-12 text-center">
                    <svg
                        class="mx-auto w-16 h-16 text-gray-400"
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
                    <p class="mt-4 text-lg font-medium text-gray-900">Tidak ada resep</p>
                    <p class="mt-2 text-sm text-gray-600">Belum ada resep yang disetujui.</p>
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
const itemsPerPage = 12;

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
