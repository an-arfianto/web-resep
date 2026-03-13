<template>
    <div class="flex flex-col gap-5 py-6 px-4 mx-auto w-full max-w-4xl lg:px-6">
        <div class="card">
            <h1 class="mb-6 text-2xl font-bold lg:text-3xl text-textPrimary">Edit Resep</h1>

            <div v-if="recipeStore.loading && !recipe" class="flex justify-center py-20">
                <div class="loading-spin"></div>
            </div>

            <form v-else-if="recipe" @submit.prevent="handleSubmit" class="flex flex-col gap-5">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Nama Resep *</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="input-field"
                        placeholder="e.g., Ayam bakar, Nasi Goreng..."
                    />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Kategori *</label>
                    <select v-model="formData.category" required class="input-field">
                        <option value="" disabled>Pilih Kategori</option>
                        <option value="Masakan Utama">Masakan Utama</option>
                        <option value="Makanan Pembuka">Makanan Pembuka</option>
                        <option value="Makanan Penutup">Makanan Penutup</option>
                        <option value="Salad">Salad</option>
                        <option value="Kue">Kue</option>
                        <option value="Sup">Sup</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Cemilan">Cemilan</option>
                    </select>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Deskripsi</label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="resize-y input-field"
                        placeholder="Jelaskan deskripsi resep"
                    ></textarea>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Bahan-bahan *</label>

                    <div class="flex flex-col gap-3">
                        <div
                            v-for="(ingredient, index) in formData.ingredients"
                            :key="index"
                            class="flex flex-col gap-2 p-3 rounded-lg border sm:flex-row sm:items-center border-border bg-background"
                        >
                            <input
                                v-model="ingredient.quantity"
                                type="number"
                                step="0.1"
                                class="w-full sm:w-28 input-field"
                                placeholder="Jumlah"
                            />
                            <select v-model="ingredient.unit" class="w-full sm:w-32 input-field">
                                <option value="">Unit</option>
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
                                <option value="jumput">jumput</option>
                                <option value="secukupnya">secukupnya</option>
                            </select>
                            <input
                                v-model="ingredient.name"
                                type="text"
                                required
                                class="flex-1 input-field"
                                placeholder="Nama Bahan"
                            />
                            <button
                                v-if="formData.ingredients.length > 1"
                                type="button"
                                @click="removeIngredient(index)"
                                class="sm:w-auto button bg-errorSoft text-error shrink-0 hover:bg-error hover:text-textInverse"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    width="16"
                                    height="16"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        @click="addIngredient"
                        class="mt-3 w-full sm:w-auto button bg-successSoft text-success hover:bg-success hover:text-textInverse"
                    >
                        + Tambah Bahan
                    </button>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Instruksi *</label>
                    <textarea
                        v-model="formData.instructions"
                        rows="8"
                        required
                        class="resize-y input-field"
                        placeholder="Jelaskan instuksi pembuatannya (e.g., 1. 2. 3. dst)..."
                    ></textarea>
                </div>

                <div v-if="error" class="alert-box alert-error">
                    <p class="text-sm font-semibold text-error">{{ error }}</p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        @click="$router.back()"
                        class="sm:w-32 button bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        :disabled="loading"
                        class="sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed button bg-primary text-textInverse hover:opacity-85"
                    >
                        {{ loading ? 'Mohon Tunggu...' : 'Simpan Perubahan' }}
                    </button>
                </div>
            </form>
        </div>

        <teleport to="body">
            <div
                v-if="showSuccessToast"
                class="flex fixed right-5 bottom-5 gap-3 items-start py-3 px-4 w-80 rounded-xl border shadow-lg border-success/30 bg-successSoft text-success z-60 max-w-[calc(100vw-40px)]"
            >
                <p class="flex-1 text-sm font-medium leading-snug">{{ successMessage }}</p>
                <button
                    @click="showSuccessToast = false"
                    class="mt-0.5 opacity-60 transition-opacity hover:opacity-100 shrink-0"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        width="14"
                        height="14"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { CreateRecipeData, Recipe, Ingredient } from '@/types';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const showSuccessToast = ref(false);
const successMessage = ref('');

const recipe = computed<Recipe | null>(() => recipeStore.currentRecipe);

const formData = reactive<CreateRecipeData>({
    name: '',
    category: '',
    description: '',
    instructions: '',
    ingredients: [{ name: '', quantity: null, unit: '' }],
});

function showSuccess(msg: string) {
    successMessage.value = msg;
    showSuccessToast.value = true;
    setTimeout(() => {
        showSuccessToast.value = false;
    }, 4000);
}

function populateForm(recipe: Recipe) {
    formData.name = recipe.name;
    formData.category = recipe.category;
    formData.description = recipe.description || '';
    formData.instructions = recipe.instructions || '';

    if (Array.isArray(recipe.ingredients)) {
        formData.ingredients = recipe.ingredients.map((ing: Ingredient) => ({
            name: ing.name,
            quantity: ing.quantity || null,
            unit: ing.unit || '',
        }));
    } else if (typeof recipe.ingredients === 'string') {
        const parsed = recipe.ingredients.split(',').map((item: string) => ({
            name: item.trim(),
            quantity: null,
            unit: '',
        }));
        formData.ingredients = parsed.length > 0 ? parsed : [{ name: '', quantity: null, unit: '' }];
    }
}

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
        error.value = 'Tambah minimal 1 bahan';
        return;
    }

    loading.value = true;
    const recipeId = Number(route.params.id);
    const result = await recipeStore.updateRecipe(recipeId, {
        ...formData,
        ingredients: validIngredients,
    });
    loading.value = false;

    if (result) {
        showSuccess(`Resep "${formData.name}" berhasil diperbarui!`);
        setTimeout(() => {
            router.push(`/recipe/${recipeId}`);
        }, 1000);
    } else {
        error.value = recipeStore.error || 'Gagal Memperbarui Resep';
    }
}

onMounted(async () => {
    const id = Number(route.params.id);
    await recipeStore.fetchRecipeById(id);
    if (recipe.value) {
        populateForm(recipe.value);
    }
});
</script>
