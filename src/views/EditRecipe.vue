<template>
    <div class="mx-auto max-w-3xl">
        <div class="card">
            <h1 class="mb-6 text-3xl font-bold text-gray-900">Edit Resep</h1>

            <div v-if="recipeStore.loading && !recipe" class="py-12 text-center">
                <div
                    class="border-primary-600 inline-block h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
                ></div>
            </div>

            <form v-else-if="recipe" @submit.prevent="handleSubmit" class="space-y-6">
                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Nama Resep </label>
                    <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="input-field"
                        placeholder="e.g., Ayam bakar, Nasi Goreng..."
                    />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Category </label>
                    <select v-model="formData.category" required class="input-field">
                        <option value="">Select a category</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Snack">Snack</option>
                    </select>
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Deskripsi </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="input-field"
                        placeholder="Jelaskan deskripsi resep"
                    ></textarea>
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Bahan </label>

                    <div
                        v-for="(ingredient, index) in formData.ingredients"
                        :key="index"
                        class="mb-2 flex gap-2"
                    >
                        <input
                            v-model="ingredient.quantity"
                            type="number"
                            step="0.01"
                            class="input-field w-24"
                            placeholder="Jumlah"
                        />
                        <select v-model="ingredient.unit" class="input-field w-32">
                            <option value="" disabled>Berat</option>
                            <option value="g">g (gram)</option>
                            <option value="kg">kg (kilogram)</option>
                            <option value="ml">ml (mililiter)</option>
                            <option value="l">l (liter)</option>
                            <option value="cup">cup (cangkir)</option>
                            <option value="sdm">sdm (sendok makan)</option>
                            <option value="sdt">sdt (sendok teh)</option>
                            <option value="butir">butir</option>
                            <option value="buah">buah</option>
                            <option value="siung">siung</option>
                            <option value="batang">batang</option>
                            <option value="lembar">lembar</option>
                            <option value="potong">potong</option>
                            <option value="pinch">pinch (sejumput)</option>
                        </select>
                        <input
                            v-model="ingredient.name"
                            type="text"
                            required
                            class="input-field flex-1"
                            placeholder="Nama Bahan"
                        />
                        <button
                            type="button"
                            @click="removeIngredient(index)"
                            class="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                        >
                            ✕
                        </button>
                    </div>

                    <button type="button" @click="addIngredient" class="btn-secondary mt-2">
                        + Tambah Bahan
                    </button>
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Instruksi </label>
                    <textarea
                        v-model="formData.instructions"
                        rows="6"
                        required
                        class="input-field"
                        placeholder="Jelaskan instuksi pembuatannya (e.g., 1. 2. 3. dst)..."
                    ></textarea>
                </div>

                <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p class="text-sm text-red-600">{{ error }}</p>
                </div>

                <div class="flex gap-4">
                    <button type="submit" :disabled="loading" class="btn-primary flex-1">
                        {{ loading ? 'Mohon Tunggu...' : 'Edit Resep' }}
                    </button>
                    <button type="button" @click="$router.back()" class="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { CreateRecipeData, Recipe } from '@/types';

const router = useRouter();
const route = useRoute();
const recipeStore = useRecipeStore();

const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const recipe = ref<Recipe | null>(null);

const formData = reactive<CreateRecipeData>({
    name: '',
    category: '',
    description: '',
    instructions: '',
    ingredients: [{ name: '', quantity: null, unit: '' }],
});

onMounted(async () => {
    const id = Number(route.params.id);
    await recipeStore.fetchRecipeById(id);

    if (recipeStore.currentRecipe) {
        recipe.value = recipeStore.currentRecipe;

        // Populate form with existing data
        formData.name = recipe.value.name;
        formData.category = recipe.value.category;
        formData.description = recipe.value.description || '';
        formData.instructions = recipe.value.instructions || '';

        // Handle ingredients
        if (Array.isArray(recipe.value.ingredients)) {
            formData.ingredients = recipe.value.ingredients.map((ing) => ({
                name: ing.name,
                quantity: ing.quantity || null,
                unit: ing.unit || '',
            }));
        } else if (typeof recipe.value.ingredients === 'string') {
            // Parse string format
            formData.ingredients = recipe.value.ingredients.split(',').map((i) => ({
                name: i.trim(),
                quantity: null,
                unit: '',
            }));
        }
    }
});

function addIngredient() {
    formData.ingredients.push({ name: '', quantity: null, unit: '' });
}

function removeIngredient(index: number) {
    if (formData.ingredients.length > 1) {
        formData.ingredients.splice(index, 1);
    }
}

async function handleSubmit() {
    error.value = null;

    const validIngredients = formData.ingredients.filter((i) => i.name.trim() !== '');

    if (validIngredients.length === 0) {
        error.value = 'Please add at least one ingredient';
        return;
    }

    loading.value = true;
    const id = Number(route.params.id);
    const result = await recipeStore.updateRecipe(id, {
        ...formData,
        ingredients: validIngredients,
    });
    loading.value = false;

    if (result) {
        router.push(`/recipe/${id}`);
    } else {
        error.value = recipeStore.error || 'Failed to update recipe';
    }
}
</script>
