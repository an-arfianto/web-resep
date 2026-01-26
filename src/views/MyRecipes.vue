<template>
    <div>
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Resep Saya</h1>
            <RouterLink to="/create-recipe" class="btn-primary"> + Tambah Resep </RouterLink>
        </div>

        <div v-if="recipeStore.loading" class="py-12 text-center">
            <div
                class="inline-block w-12 h-12 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"
            ></div>
        </div>

        <div v-else-if="recipeStore.error" class="py-12 text-center">
            <p class="text-red-600">{{ recipeStore.error }}</p>
        </div>

        <div v-else-if="myRecipes.length > 0">
            <!-- status filter -->
            <div class="flex gap-2 mb-6">
                <button
                    @click="filterStatus = 'all'"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        filterStatus === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    ]"
                >
                    Semua ({{ myRecipes.length }})
                </button>
                <button
                    @click="filterStatus = 'approved'"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        filterStatus === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    ]"
                >
                    Disetujui ({{ approvedCount }})
                </button>
                <button
                    @click="filterStatus = 'pending'"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        filterStatus === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    ]"
                >
                    Pending ({{ pendingCount }})
                </button>
                <button
                    @click="filterStatus = 'rejected'"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        filterStatus === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    ]"
                >
                    Ditolak ({{ rejectedCount }})
                </button>
            </div>

            <!-- Recipes Grid -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <RecipeCardWithStatus
                    v-for="recipe in filteredRecipes"
                    :key="recipe.id"
                    :recipe="recipe"
                />
            </div>
        </div>

        <div v-else class="py-12 text-center">
            <p class="mb-4 text-lg text-gray-600">Anda belum membuat resep.</p>
            <RouterLink to="/create-recipe" class="btn-primary">
                Buat resep untuk pertama kali
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
// import { useAuthStore } from '@/stores/authStore';
import RecipeCardWithStatus from '@/components/RecipeCardWithStatus.vue';
import type { Recipe } from '@/types';

const recipeStore = useRecipeStore();
// const authStore = useAuthStore();

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
    // Check if rejected recipes have rejection_reason field
    const rejectedRecipes = recipeStore.myRecipes.filter((r) => r.status === 'rejected');
    console.log('Rejected recipes:', rejectedRecipes);
});
</script>
