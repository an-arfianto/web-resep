<template>
    <div id="app" class="min-h-screen">
        <Navbar />
        <main class="container py-4 px-2 mx-auto">
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/Navbar.vue';

const authStore = useAuthStore();

onMounted(() => {
    authStore.checkAuth();
});
</script>
