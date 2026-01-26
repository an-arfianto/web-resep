<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div v-if="loading" class="py-12 text-center">
            <div
                class="inline-block w-12 h-12 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"
            ></div>
        </div>

        <div v-else>
            <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                <div class="bg-blue-50 border-blue-200 card">
                    <h3 class="mb-2 text-lg font-semibold text-blue-900">Total User</h3>
                    <p class="text-4xl font-bold text-blue-600">{{ stats?.totalUsers || 0 }}</p>
                </div>

                <div class="bg-green-50 border-green-200 card">
                    <h3 class="mb-2 text-lg font-semibold text-green-900">Total Resep</h3>
                    <p class="text-4xl font-bold text-green-600">{{ stats?.totalRecipes || 0 }}</p>
                </div>

                <div class="bg-purple-50 border-purple-200 card">
                    <h3 class="mb-2 text-lg font-semibold text-purple-900">Kategori</h3>
                    <p class="text-4xl font-bold text-purple-600">
                        {{ stats?.recipesByCategory?.length || 0 }}
                    </p>
                </div>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
                <div class="card">
                    <h2 class="mb-4 text-2xl font-bold">Menu</h2>
                    <div class="space-y-3">
                        <RouterLink
                            to="/admin/users"
                            class="block p-4 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                        >
                            <h3 class="font-semibold text-blue-900">Kelola User</h3>
                            <p class="text-sm text-blue-700">Kelola semua user</p>
                        </RouterLink>
                        <RouterLink
                            to="/admin/recipes"
                            class="block p-4 bg-green-50 rounded-lg transition-colors hover:bg-green-100"
                        >
                            <h3 class="font-semibold text-green-900">Kelola Resep</h3>
                            <p class="text-sm text-green-700">Kelola semua resep masakan</p>
                        </RouterLink>
                    </div>
                </div>

                <div class="card">
                    <h2 class="mb-4 text-2xl font-bold">Total Resep berdasarkan Kategori</h2>
                    <div v-if="stats?.recipesByCategory" class="space-y-2">
                        <div
                            v-for="cat in stats.recipesByCategory"
                            :key="cat.category"
                            class="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                            <span class="font-medium">{{ cat.category }}</span>
                            <span
                                class="py-1 px-3 text-sm font-semibold rounded-full bg-primary-100 text-primary-700"
                            >
                                {{ cat.count }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

// const router = useRouter();
// const authStore = useAuthStore();
const stats = ref<any>(null);
const loading = ref(true);

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
