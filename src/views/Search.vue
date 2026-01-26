<template>
    <div>
        <div class="mb-8 card">
            <h1 class="mb-6 text-3xl font-bold text-gray-900">Pencarian Resep Boolean Retrieval</h1>

            <div class="space-y-4">
                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                        Operator Pencarian
                    </label>
                    <select v-model="searchData.operator" class="input-field">
                        <option value="OR">
                            OR - Cari resep yang terdapat beberapa bahan tersebut
                        </option>
                        <option value="AND">
                            AND - Cari resep yang terdapat semua bahan tersebut
                        </option>
                        <option value="NOT">
                            NOT - Cari resep yang terdapat bahan dan dengan pengecualian
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                        Bahan (Gunakan koma sebagai pemisah antar bahan)
                    </label>
                    <input
                        v-model="ingredientsInput"
                        type="text"
                        placeholder="e.g., ayam, nasi, kecap"
                        class="input-field"
                        @keypress.enter="handleSearch"
                    />
                </div>

                <div v-if="searchData.operator === 'NOT'">
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                        Bahan yang tidak diinginkan
                    </label>
                    <input
                        v-model="excludedInput"
                        type="text"
                        placeholder="e.g., babi, cabai, wine"
                        class="input-field"
                        @keypress.enter="handleSearch"
                    />
                </div>

                <button
                    @click="handleSearch"
                    :disabled="recipeStore.loading"
                    class="w-full md:w-auto btn-primary"
                >
                    {{ recipeStore.loading ? 'Mohon Tunggu...' : 'Cari Resep' }}
                </button>
            </div>
        </div>

        <div v-if="searched">
            <div v-if="recipeStore.loading" class="py-12 text-center">
                <div
                    class="inline-block w-12 h-12 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"
                ></div>
            </div>

            <div v-else>
                <div class="mb-6 bg-blue-50 border-blue-200 card">
                    <h2 class="mb-2 text-xl font-bold text-gray-900">Hasil Pencarian</h2>
                    <p class="text-gray-700">
                        Ditemukan
                        <span class="font-bold">{{ searchResult?.count || 0 }}</span>
                        resep menggunakan
                        <span class="font-bold">{{ searchResult?.operator }}</span>
                        operator
                    </p>
                    <p class="mt-2 text-sm text-gray-600">
                        Bahan yang diinginkan:
                        {{ searchResult?.searchedIngredients?.join(', ') }}
                    </p>
                    <p v-if="searchResult?.excludedIngredients" class="text-sm text-gray-600">
                        Bahan yang tidak diinginkan:
                        {{ searchResult?.excludedIngredients?.join(', ') }}
                    </p>
                </div>

                <div
                    v-if="searchResult && searchResult.count > 0"
                    class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    <RecipeCard
                        v-for="recipe in recipeStore.searchResults"
                        :key="recipe.id"
                        :recipe="recipe"
                    />
                </div>

                <div v-else class="py-12 text-center">
                    <p class="text-lg text-gray-600">Resep tidak ditemukan.</p>
                    <p class="mt-2 text-gray-500">Coba dengan bahan yang lain.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRecipeStore } from '@/stores/recipeStore';
import RecipeCard from '@/components/RecipeCard.vue';
import type { SearchCriteria, SearchResponse } from '@/types';

const recipeStore = useRecipeStore();

const ingredientsInput = ref<string>('');
const excludedInput = ref<string>('');
const searched = ref<boolean>(false);
const searchResult = ref<SearchResponse | null>(null);

const searchData = reactive<SearchCriteria>({
    operator: 'OR',
    ingredients: [],
    excludedIngredients: [],
});

async function handleSearch(): Promise<void> {
    const ingredients = ingredientsInput.value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

    if (ingredients.length === 0) {
        alert('Please enter at least one ingredient');
        return;
    }

    searchData.ingredients = ingredients;

    if (searchData.operator === 'NOT') {
        const excluded = excludedInput.value
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean);

        if (excluded.length === 0) {
            alert('Please enter excluded ingredients for NOT operator');
            return;
        }
        searchData.excludedIngredients = excluded;
    } else {
        searchData.excludedIngredients = [];
    }

    const result = await recipeStore.searchRecipes(searchData);
    searched.value = true;
    searchResult.value = result;
}
</script>
