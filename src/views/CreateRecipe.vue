<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { CreateRecipeData } from '@/types';
import { recipeCategory, unitIng } from '@/utils/recipeUtils';

const router = useRouter();
const recipeStore = useRecipeStore();

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const showSuccessToast = ref(false);
const successMessage = ref('');

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
    const result = await recipeStore.createRecipe({
        ...formData,
        ingredients: validIngredients,
    });
    loading.value = false;

    if (result) {
        showSuccess(`Resep "${formData.name}" berhasil ditambahkan!`);
        setTimeout(() => {
            router.push('/my-recipes');
        }, 1000);
    } else {
        error.value = recipeStore.error || 'Gagal Membuat Resep';
    }
}
</script>

<template>
    <div class="container-body">
        <div class="card">
            <h1 class="mb-4 card-title">Tambah Resep Baru</h1>

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
                <div>
                    <label class="input-field-title">Nama Resep *</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        required
                        class="input-field"
                        placeholder="e.g., Ayam bakar, Nasi Goreng..."
                    />
                </div>

                <div>
                    <label class="input-field-title">Kategori *</label>
                    <select v-model="formData.category" required class="input-field">
                        <option value="" disabled>Pilih Kategori</option>
                        <option
                            v-for="category in recipeCategory"
                            :key="category"
                            :value="category"
                        >
                            {{ category }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="input-field-title">Deskripsi</label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="resize-y input-field"
                        placeholder="Jelaskan deskripsi resep"
                    ></textarea>
                </div>

                <div>
                    <label class="input-field-title">Bahan-bahan *</label>
                    <div class="flex flex-col gap-2">
                        <div
                            v-for="(ingredient, index) in formData.ingredients"
                            :key="index"
                            class="flex flex-col gap-2 p-1 rounded-lg border sm:flex-row sm:items-center border-border bg-background"
                        >
                            <input
                                v-model="ingredient.quantity"
                                type="number"
                                step="1"
                                class="w-full sm:w-32 input-field"
                                placeholder="Jumlah"
                            />
                            <select v-model="ingredient.unit" class="w-full sm:w-48 input-field">
                                <option value="" disabled>Unit</option>
                                <option
                                    v-for="unit in unitIng"
                                    :key="unit.value"
                                    :value="unit.value"
                                >
                                    {{ unit.label }}
                                </option>
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
                                class="button bg-errorSoft text-error hover:bg-error hover:text-textInverse"
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
                    <label class="input-field-title">Instruksi *</label>
                    <textarea
                        v-model="formData.instructions"
                        rows="8"
                        required
                        class="resize-y input-field"
                        placeholder="Jelaskan instuksi pembuatannya (e.g., 1. 2. 3. dst)..."
                    ></textarea>
                </div>

                <div v-if="error" class="alert-box">
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
                        class="sm:flex-1 disabled:opacity-50 button bg-primary text-textInverse hover:opacity-85"
                    >
                        {{ loading ? 'Mohon Tunggu...' : 'Tambah Resep' }}
                    </button>
                </div>
            </form>
        </div>

        <teleport to="body">
            <div v-if="showSuccessToast" class="toast">
                <p class="toast-text">{{ successMessage }}</p>
                <button @click="showSuccessToast = false" class="toast-close-btn">
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
