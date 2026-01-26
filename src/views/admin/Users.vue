<template>
    <div class="container py-8 px-4 mx-auto max-w-7xl">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Manage Users</h1>
            <RouterLink to="/admin" class="btn-secondary">← Dashboard</RouterLink>
        </div>

        <div v-if="loading" class="py-12 text-center">
            <div class="inline-block w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-primary-600"></div>
        </div>

        <div v-else>
            <div class="card">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b-2 border-gray-200">
                                <th class="p-4 font-semibold text-left">ID</th>
                                <th class="p-4 font-semibold text-left">Username</th>
                                <th class="p-4 font-semibold text-left">Role</th>
                                <th class="p-4 font-semibold text-left">Resep</th>
                                <th class="p-4 font-semibold text-left">Bergabung</th>
                                <th class="p-4 font-semibold text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="user in paginatedUsers"
                                :key="user.id"
                                class="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td class="p-4 text-gray-600">{{ user.id }}</td>
                                <td class="p-4 font-medium">{{ user.username }}</td>
                                <td class="p-4">
                                    <span
                                        :class="
                                            user.role_id === 1
                                                ? 'bg-red-100 text-red-700'
                                                : user.role_id === 3
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                        "
                                        class="py-1 px-3 text-sm font-semibold rounded-full"
                                    >
                                        {{ user.role_name }}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span class="py-1 px-3 text-sm font-semibold rounded-full bg-primary-100 text-primary-700">
                                        {{ user.recipe_count || 0 }}
                                    </span>
                                </td>
                                <td class="p-4 text-sm text-gray-600">
                                    {{ formatDate(user.created_at) }}
                                </td>
                                <td class="p-4">
                                    <div class="flex gap-2">
                                        <!-- Promote to Moderator (only for regular users) -->
                                        <button
                                            v-if="user.role_id === 2"
                                            @click="promoteUser(user.id, user.username)"
                                            class="py-1.5 px-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                                            title="Promote to Moderator"
                                        >
                                            ↑ Promote
                                        </button>

                                        <!-- Demote to User (only for moderators) -->
                                        <button
                                            v-if="user.role_id === 3"
                                            @click="demoteUser(user.id, user.username)"
                                            class="py-1.5 px-3 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg transition-colors hover:bg-orange-100"
                                            title="Demote to User"
                                        >
                                            ↓ Demote
                                        </button>

                                        <!-- Delete User (only non-admins) -->
                                        <button
                                            v-if="user.role_id !== 1"
                                            @click="deleteUser(user.id, user.username, user.recipe_count)"
                                            class="py-1.5 px-3 text-sm font-medium text-red-700 bg-red-50 rounded-lg transition-colors hover:bg-red-100"
                                            title="Delete User"
                                        >
                                            Delete
                                        </button>

                                        <!-- Admin indicator (no actions) -->
                                        <span
                                            v-if="user.role_id === 1"
                                            class="py-1.5 px-3 text-sm text-gray-500 italic"
                                        >
                                            Protected
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pagination -->
            <Pagination
                v-if="users.length > 0"
                :current-page="currentPage"
                :total-items="users.length"
                :items-per-page="itemsPerPage"
                @page-change="handlePageChange"
            />

            <div v-if="users.length === 0" class="py-12 text-center">
                <p class="text-gray-600">Tidak ada user.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Pagination from '@/components/Pagination.vue';

const users = ref<any[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 15;

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return users.value.slice(start, end);
});

onMounted(async () => {
    fetchUsers();
});

async function fetchUsers() {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
        });
        users.value = response.data.data;
    } catch (err) {
        console.error(err);
        alert('Failed to load users');
    } finally {
        loading.value = false;
    }
}

async function promoteUser(userId: number, username: string) {
    if (!confirm(`Promote ${username} to Moderator?\n\nThey will be able to approve/reject recipes.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/admin/users/${userId}/promote`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        alert(`${username} has been promoted to Moderator!`);
        await fetchUsers();
    } catch (err: any) {
        alert('Failed to promote user: ' + (err.response?.data?.message || err.message));
    }
}

async function demoteUser(userId: number, username: string) {
    if (!confirm(`Demote ${username} back to regular User?\n\nThey will lose moderator privileges.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/admin/users/${userId}/demote`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        alert(`${username} has been demoted to User.`);
        await fetchUsers();
    } catch (err: any) {
        alert('Failed to demote user: ' + (err.response?.data?.message || err.message));
    }
}

async function deleteUser(userId: number, username: string, recipeCount: number) {
    const recipeWarning = recipeCount > 0 
        ? `\n\n⚠️ WARNING: This will also DELETE ${recipeCount} recipe(s) created by this user!`
        : '';
    
    if (!confirm(`Are you sure you want to DELETE user "${username}"?${recipeWarning}\n\nThis action CANNOT be undone!`)) {
        return;
    }

    // Double confirmation for users with recipes
    if (recipeCount > 0) {
        if (!confirm(`FINAL CONFIRMATION:\n\nDelete "${username}" and their ${recipeCount} recipe(s)?\n\nType the username to confirm.`)) {
            return;
        }
    }

    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        // Remove from array
        users.value = users.value.filter(u => u.id !== userId);
        
        // Adjust page if current page is empty
        if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
        }
        
        alert(`User "${username}" has been deleted.`);
    } catch (err: any) {
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function handlePageChange(page: number) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
