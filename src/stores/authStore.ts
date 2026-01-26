import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import type { User, LoginCredentials, RegisterData, ApiError } from "@/types";

export const useAuthStore = defineStore("auth", () => {
	const user = ref<User | null>(null);
	const token = ref<string | null>(localStorage.getItem("token"));
	const loading = ref<boolean>(false);
	const error = ref<string | null>(null);

	const isAuthenticated = computed(() => !!token.value && !!user.value);

	async function register(userData: RegisterData): Promise<boolean> {
		loading.value = true;
		error.value = null;
		try {
			const response = await api.auth.register(userData);
			token.value = response.data.token;
			user.value = response.data.user;
			localStorage.setItem("token", response.data.token);
			return true;
		} catch (err) {
			const apiError = err as ApiError;
			error.value = apiError.message;
			return false;
		} finally {
			loading.value = false;
		}
	}

	async function login(credentials: LoginCredentials): Promise<boolean> {
		loading.value = true;
		error.value = null;
		try {
			const response = await api.auth.login(credentials);
			token.value = response.data.token;
			user.value = response.data.user;
			localStorage.setItem("token", response.data.token);
			return true;
		} catch (err) {
			const apiError = err as ApiError;
			error.value = apiError.message;
			return false;
		} finally {
			loading.value = false;
		}
	}

	async function checkAuth(): Promise<void> {
		if (!token.value) return;

		try {
			const response = await api.auth.getCurrentUser();
			user.value = response.data;
		} catch (err) {
			logout();
		}
	}

	function logout(): void {
		user.value = null;
		token.value = null;
		localStorage.removeItem("token");
	}

	return {
		user,
		token,
		loading,
		error,
		isAuthenticated,
		register,
		login,
		checkAuth,
		logout,
	};
});
