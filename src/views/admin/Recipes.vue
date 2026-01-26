<template>
    <div class="container py-8 px-4 mx-auto max-w-7xl">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Kelola Resep</h1>
            <RouterLink to="/admin" class="btn-secondary">← Dashboard</RouterLink>
        </div>

        <div v-if="loading" class="py-12 text-center">
            <div
                class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"
            ></div>
        </div>

        <div v-else>
            <div class="space-y-4">
                <div v-for="recipe in paginatedRecipes" :key="recipe.id" class="card">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="mb-2 text-xl font-bold">{{ recipe.name }}</h3>
                            <div class="flex gap-3 items-center mb-2">
                                <span
                                    class="py-1 px-3 text-sm font-semibold rounded-full bg-primary-100 text-primary-700"
                                >
                                    {{ recipe.category }}
                                </span>
                                <span class="text-sm text-gray-600">oleh: {{ recipe.author }}</span>
                            </div>
                            <p class="text-sm text-gray-600 line-clamp-2">
                                {{ recipe.ingredients }}
                            </p>
                            <p class="mt-2 text-xs text-gray-500">
                                Dibuat: {{ formatDate(recipe.created_at) }}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <RouterLink :to="`/recipe/${recipe.id}`" class="btn-secondary">
                                Lihat
                            </RouterLink>
                            <button
                                @click="deleteRecipe(recipe.id)"
                                class="py-2 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <Pagination
                v-if="recipes.length > 0"
                :current-page="currentPage"
                :total-items="recipes.length"
                :items-per-page="itemsPerPage"
                @page-change="handlePageChange"
            />

            <div v-if="recipes.length === 0" class="py-12 text-center">
                <p class="text-gray-600">Tidak ada resep.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Pagination from '@/components/Pagination.vue';

const recipes = ref<any[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;

const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return recipes.value.slice(start, end);
});

onMounted(async () => {
    fetchRecipes();
});

async function fetchRecipes() {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/recipes', {
            headers: { Authorization: `Bearer ${token}` },
        });
        recipes.value = response.data.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function deleteRecipe(id: number) {
    if (!confirm('Anda yakin ingin menghapus resep ini?')) return;

    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/recipes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Remove from array
        recipes.value = recipes.value.filter((r) => r.id !== id);

        // Adjust page if current page is empty
        if (paginatedRecipes.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
        }
    } catch (err: any) {
        alert('Gagal menghapus resep: ' + err.message);
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
