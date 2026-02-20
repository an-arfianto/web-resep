<template>
    <div class="mx-auto max-w-md">
        <div class="card">
            <h1 class="mb-6 text-center text-3xl font-bold text-gray-900">Register</h1>

            <form @submit.prevent="handleRegister" class="space-y-4">
                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Username </label>
                    <input v-model="formData.username" type="text" required class="input-field"
                        placeholder="Isi username anda" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"> Password </label>
                    <input v-model="formData.password" type="password" required minlength="6" class="input-field"
                        placeholder="Isi minimal 6 karakter" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                        Konfirmasi Password
                    </label>
                    <input v-model="confirmPassword" type="password" required class="input-field"
                        placeholder="Isi ulang password anda" />
                </div>

                <div v-if="authStore.error" class="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p class="text-sm text-red-600">{{ authStore.error }}</p>
                </div>

                <button type="submit" :disabled="authStore.loading" class="btn-primary w-full">
                    {{ authStore.loading ? 'Mohon Tunggu...' : 'Register' }}
                </button>

                <p class="text-center text-gray-600">
                    Sudah memiliki akun?
                    <RouterLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                        Login!
                    </RouterLink>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { RegisterData } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive<RegisterData>({
    username: '',
    password: '',
    role_id: 3,
});

const confirmPassword = ref<string>('');

async function handleRegister(): Promise<void> {
    if (formData.password !== confirmPassword.value) {
        authStore.error = 'Passwords do not match';
        return;
    }

    const success = await authStore.register(formData);
    if (success) {
        router.push('/');
    }
}
</script>
