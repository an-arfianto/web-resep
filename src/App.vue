<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/Navbar.vue';

const authStore = useAuthStore();
const cachedRoutes = computed(() => ['Search']);

onMounted(() => {
    authStore.checkAuth();
});
</script>

<template>
    <div id="app" class="min-h-screen">
        <Navbar />
        <main class="container py-4 px-4 mx-auto">
            <RouterView v-slot="{ Component }">
                <KeepAlive :include="cachedRoutes">
                    <component :is="Component" />
                </KeepAlive>
            </RouterView>
        </main>
    </div>
</template>
