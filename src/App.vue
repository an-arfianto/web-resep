<template>
    <div class="container">
        <h1>User Details</h1>

        <input type="number" v-model.number="userId" placeholder="Enter user ID" />
        <button @click="getUser">Get User</button>

        <div v-if="user">
            <h2>{{ user.username }}</h2>
            <p>Id: {{ user.id }}</p>
            <p>Role: {{ user.roles }}</p>
            <p>Password: {{ user.password }}</p>
        </div>

        <p v-else>No user found.</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface User {
    id: number
    username: string
    password: string
    roles: string
}

interface ApiResponse {
    success: boolean
    data: User[]
}

const userId = ref<number>(1)
const user = ref<User | null>(null)

const getUser = async () => {
    const res = await fetch("api/user")
    const data: ApiResponse = await res.json()

    if (data.success === true) {
        user.value = data.data.find((u) => u.id === userId.value) || null
    } else {
        user.value = null
    }
}
</script>

<style scoped>
.container {
    max-width: 500px;
    margin: 2rem auto;
    text-align: center;
}
</style>
