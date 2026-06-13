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
});

const confirmPassword = ref<string>('');

async function handleRegister(): Promise<void> {
    if (formData.password !== confirmPassword.value) {
        authStore.error = 'Password tidak sama';
        return;
    }

    const success = await authStore.register(formData);
    if (success) {
        router.push('/');
    }
}
</script>

<template>
    <div class="max-w-xl container-body">
        <div class="card">
            <h1 class="mb-4 card-title">Register</h1>

            <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
                <div>
                    <label class="input-field-title"> Username </label>
                    <input
                        v-model="formData.username"
                        type="text"
                        required
                        class="input-field"
                        placeholder="Masukan username anda"
                    />
                </div>

                <div>
                    <label class="input-field-title"> Password </label>
                    <input
                        v-model="formData.password"
                        type="password"
                        required
                        minlength="6"
                        class="input-field"
                        placeholder="Masukan minimal 6 karakter"
                    />
                </div>

                <div>
                    <label class="input-field-title"> Konfirmasi Password </label>
                    <input
                        v-model="confirmPassword"
                        type="password"
                        required
                        class="input-field"
                        placeholder="Masukan ulang password anda"
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
                    {{ authStore.loading ? 'Mohon Tunggu...' : 'Register' }}
                </button>

                <p class="text-sm text-center text-textSecondary">
                    Sudah memiliki akun?
                    <RouterLink
                        to="/login"
                        class="font-semibold text-primary hover:text-primaryPressed"
                    >
                        Login!
                    </RouterLink>
                </p>
            </form>
        </div>
    </div>
</template>
