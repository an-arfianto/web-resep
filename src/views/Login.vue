<template>
    <div class="mx-auto max-w-md">
        <div class="card">
            <h1 class="mb-6 text-3xl font-bold text-center text-gray-900">Login</h1>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Username </label>
                    <input
                        v-model="formData.username"
                        type="text"
                        required
                        class="input-field"
                        placeholder="Masukan username anda"
                    />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-700"> Password </label>
                    <input
                        v-model="formData.password"
                        type="password"
                        required
                        class="input-field"
                        placeholder="Masukan password anda"
                    />
                </div>

                <div v-if="authStore.error" class="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p class="text-sm text-red-600">{{ authStore.error }}</p>
                </div>

                <button type="submit" :disabled="authStore.loading" class="w-full btn-primary">
                    {{ authStore.loading ? 'Mohon Tunggu...' : 'Login' }}
                </button>

                <p class="text-center text-gray-600">
                    Tidak punya akun?
                    <RouterLink
                        to="/register"
                        class="font-medium text-primary-600 hover:text-primary-700"
                    >
                        Registrasi!
                    </RouterLink>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { LoginCredentials } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive<LoginCredentials>({
    username: '',
    password: '',
});

async function handleLogin(): Promise<void> {
    const success = await authStore.login(formData);
    if (success) {
        router.push('/');
    }
}
</script>
