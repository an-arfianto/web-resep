<template>
    <div class="flex flex-col gap-5 p-4 mx-auto w-full max-w-xl lg:px-6">
        <div class="card">
            <h1 class="mb-6 text-3xl font-bold text-center text-textPrimary">Login</h1>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Username</label>
                    <input
                        v-model="formData.username"
                        type="text"
                        required
                        class="input-field"
                        placeholder="Masukan username anda"
                    />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-textSecondary">Password</label>
                    <input
                        v-model="formData.password"
                        type="password"
                        required
                        class="input-field"
                        placeholder="Masukan password anda"
                    />
                </div>

                <div v-if="authStore.error" class="alert-box alert-error">
                    <p class="text-sm font-semibold">{{ authStore.error }}</p>
                </div>

                <button
                    type="submit"
                    :disabled="authStore.loading"
                    class="w-full button bg-primary text-textInverse hover:bg-primarySoft hover:text-primary"
                >
                    {{ authStore.loading ? 'Mohon Tunggu...' : 'Login' }}
                </button>

                <p class="text-sm text-center text-textSecondary">
                    Tidak memiliki akun?
                    <RouterLink to="/register" class="font-semibold text-primary hover:text-primaryPressed">
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
        const userRole = authStore.user?.role_id;

        if (userRole === 1) {
            router.push('/admin');
        } else if (userRole === 2) {
            router.push('/moderation');
        } else {
            router.push('/');
        }
    }
}
</script>
