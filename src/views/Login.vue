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
        if (authStore.isAdmin) {
            router.push('/admin');
        } else {
            router.push('/');
        }
    }
}
</script>

<template>
    <div class="max-w-xl container-body">
        <div class="card">
            <h1 class="mb-4 card-title">Login</h1>

            <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
                <div>
                    <label class="input-field-title">Username</label>
                    <input
                        v-model="formData.username"
                        type="text"
                        required
                        class="input-field"
                        placeholder="Masukan username anda"
                    />
                </div>

                <div>
                    <label class="input-field-title">Password</label>
                    <input
                        v-model="formData.password"
                        type="password"
                        required
                        class="input-field"
                        placeholder="Masukan password anda"
                    />
                </div>

                <div v-if="authStore.error" class="alert-box">
                    <p class="alert-text">{{ authStore.error }}</p>
                </div>

                <button
                    type="submit"
                    :disabled="authStore.loading"
                    class="w-full button bg-primary text-textInverse hover:bg-primaryPressed"
                >
                    {{ authStore.loading ? 'Mohon Tunggu...' : 'Login' }}
                </button>

                <p class="text-sm text-center text-textSecondary">
                    Tidak memiliki akun?
                    <RouterLink
                        to="/register"
                        class="font-semibold text-primary hover:text-primaryPressed"
                    >
                        Registrasi!
                    </RouterLink>
                </p>
            </form>
        </div>
    </div>
</template>
