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

const errors = reactive({
    ingredients: '',
    excluded: '',
});

const searchData = reactive<SearchCriteria>({
    operator: 'OR',
    ingredients: [],
    excludedIngredients: [],
});

function clearError(field: 'ingredients' | 'excluded') {
    errors[field] = '';
}

function clearErrors() {
    errors.ingredients = '';
    errors.excluded = '';
}

function handleOperatorChange() {
    clearErrors();
    if (searchData.operator !== 'NOT') {
        excludedInput.value = '';
    }
}

async function handleSearch(): Promise<void> {
    clearErrors();

    const ingredients = ingredientsInput.value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

    if (ingredients.length === 0) {
        errors.ingredients = 'Masukan setidaknya 1 bahan untuk pencarian';
        return;
    }

    searchData.ingredients = ingredients;

    if (searchData.operator === 'NOT') {
        const excluded = excludedInput.value
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean);

        if (excluded.length === 0) {
            errors.excluded = 'Masukan bahan pengecualian jika ingin menggunakan operator NOT';
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

<template>
    <div class="container-body">
        <div class="card">
            <h1 class="mb-4 card-title">Pencarian Resep Boolean Retrieval</h1>

            <div class="flex flex-col gap-4">
                <div>
                    <label class="input-field-title"> Operator Pencarian </label>
                    <select
                        v-model="searchData.operator"
                        class="input-field"
                        @change="handleOperatorChange"
                    >
                        <option value="OR">
                            OR - Cari resep yang terdapat beberapa bahan tersebut
                        </option>
                        <option value="AND">
                            AND - Cari resep yang terdapat semua bahan tersebut
                        </option>
                        <option value="NOT">
                            NOT - Cari resep yang terdapat bahan dengan pengecualian
                        </option>
                    </select>
                </div>

                <div>
                    <label class="input-field-title"> Bahan-bahan * </label>
                    <input
                        v-model="ingredientsInput"
                        type="text"
                        placeholder="e.g., ayam, nasi, kecap"
                        :class="['input-field',
                            errors.ingredients && 'border-error focus:ring-error',
                        ]"
                        @keypress.enter="handleSearch"
                        @input="clearError('ingredients')"
                    />
                    <p v-if="!errors.ingredients" class="mt-1 text-xs text-textMuted">
                        Gunakan koma sebagai pemisah antar bahan
                    </p>
                    <p v-else class="mt-1 text-xs text-error">{{ errors.ingredients }}</p>
                </div>

                <div v-if="searchData.operator === 'NOT'">
                    <label class="input-field-title"> Bahan-bahan yang tidak diinginkan * </label>
                    <input
                        v-model="excludedInput"
                        type="text"
                        placeholder="e.g., babi, cabai, wine"
                        :class="['input-field', errors.excluded && 'border-error focus:ring-error']"
                        @keypress.enter="handleSearch"
                        @input="clearError('excluded')"
                    />
                    <p v-if="!errors.excluded" class="mt-1 text-xs text-textMuted">
                        Resep yang mengandung bahan ini akan dikecualikan
                    </p>
                    <p v-else class="mt-1 text-xs text-error">{{ errors.excluded }}</p>
                </div>

                <button
                    @click="handleSearch"
                    :disabled="recipeStore.loading"
                    class="w-auto disabled:opacity-50 button bg-primary text-textInverse hover:opacity-85"
                >
                    {{ recipeStore.loading ? 'Mohon Tunggu...' : 'Cari Resep' }}
                </button>
            </div>
        </div>

        <div v-if="recipeStore.loading" class="flex justify-center py-20">
            <div class="loading-spin"></div>
        </div>

        <template v-else-if="searched">
            <div v-if="recipeStore.error" class="card bg-errorSoft">
                <p class="card-subtitle text-error">{{ recipeStore.error }}</p>
            </div>

            <template v-else>
                <div class="card bg-secondarySoft/50">
                    <div class="flex flex-col gap-3">
                        <div>
                            <p class="card-title">Hasil Pencarian</p>
                            <p class="card-subtitle">
                                Ditemukan
                                <b>{{ searchResult?.count || 0 }}</b>
                                resep menggunakan operator
                                <b> {{ searchResult?.operator }} </b>
                            </p>
                        </div>

                        <div class="pt-3 border-t border-divider">
                            <p class="font-bold uppercase card-subtitle">Bahan yang dicari:</p>
                            <div class="flex flex-wrap gap-1.5">
                                <span
                                    v-for="ingredient in searchResult?.searchedIngredients"
                                    :key="ingredient"
                                    class="category-badges bg-successSoft text-success"
                                >
                                    {{ ingredient }}
                                </span>
                            </div>
                        </div>

                        <div
                            v-if="searchResult?.excludedIngredients?.length"
                            class="pt-3 border-t border-divider"
                        >
                            <p class="font-bold uppercase card-subtitle">
                                Bahan yang dikecualikan:
                            </p>
                            <div class="flex flex-wrap gap-1.5">
                                <span
                                    v-for="ingredient in searchResult?.excludedIngredients"
                                    :key="ingredient"
                                    class="category-badges bg-errorSoft text-error"
                                >
                                    {{ ingredient }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="searchResult && searchResult.count > 0"
                    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    <RecipeCard
                        v-for="recipe in searchResult.data"
                        :key="recipe.id"
                        :recipe="recipe"
                    />
                </div>

                <div v-else class="flex flex-col gap-3 items-center card py-15">
                    <div class="text-center">
                        <p class="card-title">Resep tidak ditemukan</p>
                        <p class="card-subtitle">
                            Coba dengan bahan yang lain atau ubah operator pencarian
                        </p>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>
