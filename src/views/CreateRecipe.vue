<template>
    <div class="mx-auto max-w-3xl">
        <div class="card">
            <h1 class="mb-6 text-3xl font-bold text-gray-900">Tambah Resep</h1>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Nama Resep </label>
                    <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="input-field"
                        placeholder="e.g., Ayam bakar, Nasi Goreng..."
                    />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Kategori </label>
                    <select v-model="formData.category" required class="input-field">
                        <option value="" disabled>Pilih Kategori</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Snack">Snack</option>
                    </select>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Deskripsi </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="input-field"
                        placeholder="Jelaskan deskripsi resep"
                    ></textarea>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Bahan </label>

                    <div
                        v-for="(ingredient, index) in formData.ingredients"
                        :key="index"
                        class="flex gap-2 mb-2"
                    >
                        <input
                            v-model="ingredient.quantity"
                            type="number"
                            step="0.01"
                            class="w-28 input-field"
                            placeholder="Jumlah"
                        />
                        <select v-model="ingredient.unit" class="w-32 input-field">
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
                            class="flex-1 input-field"
                            placeholder="Nama Bahan"
                        />
                        <button
                            type="button"
                            @click="removeIngredient(index)"
                            class="py-2 px-3 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                        >
                            ✕
                        </button>
                    </div>

                    <button type="button" @click="addIngredient" class="mt-2 btn-secondary">
                        + Tambah Bahan
                    </button>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Instruksi </label>
                    <textarea
                        v-model="formData.instructions"
                        rows="6"
                        required
                        class="input-field"
                        placeholder="Jelaskan instuksi pembuatannya (e.g., 1. 2. 3. dst)..."
                    ></textarea>
                </div>

                <div v-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p class="text-sm text-red-600">{{ error }}</p>
                </div>

                <div class="flex gap-4">
                    <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                        {{ loading ? 'Mohon Tunggu...' : 'Buat Resep' }}
                    </button>
                    <button type="button" @click="$router.back()" class="btn-secondary">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { CreateRecipeData } from '@/types';

const router = useRouter();
const recipeStore = useRecipeStore();

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const formData = reactive<CreateRecipeData>({
    name: '',
    category: '',
    description: '',
    instructions: '',
    ingredients: [{ name: '', quantity: null, unit: '' }],
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

    // Filter out empty ingredients
    const validIngredients = formData.ingredients.filter((i) => i.name.trim() !== '');

    if (validIngredients.length === 0) {
        error.value = 'Tambah minimal 1 bahan';
        return;
    }

    loading.value = true;
    const result = await recipeStore.createRecipe({
        ...formData,
        ingredients: validIngredients,
    });
    loading.value = false;

    if (result) {
        router.push(`/recipe/${result.data.id}`);
    } else {
        error.value = recipeStore.error || 'Gagal Membuat Resep';
    }
}
</script>
