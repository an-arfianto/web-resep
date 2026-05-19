import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
    // public routes
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { guest: true },
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { guest: true },
    },

    // protect routes
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfilePage.vue'),
        meta: { requiresAuth: true },
    },

    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/Search.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },
    {
        path: '/recipe/:id',
        name: 'RecipeDetail',
        component: () => import('@/views/RecipeDetail.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },
    {
        path: '/my-recipes',
        name: 'MyRecipes',
        component: () => import('@/views/MyRecipes.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },
    {
        path: '/create-recipe',
        name: 'CreateRecipe',
        component: () => import('@/views/CreateRecipe.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },
    {
        path: '/edit-recipe/:id',
        name: 'EditRecipe',
        component: () => import('@/views/EditRecipe.vue'),
        meta: { requiresAuth: true, userOnly: true },
    },

    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/admin/recipes',
        name: 'AdminRecipes',
        component: () => import('@/views/admin/Recipes.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    if (authStore.token && !authStore.user) {
        await authStore.checkAuth();
    }

    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    if (to.meta.guest) {
        if (isAuthenticated) {
            next(isAdmin ? '/admin' : '/');
        } else {
            next();
        }
        return;
    }

    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            next('/login');
            return;
        }

        if (to.meta.requiresAdmin && !isAdmin) {
            next('/');
            return;
        }

        if (to.meta.userOnly && isAdmin) {
            next('/admin');
            return;
        }

        next();
        return;
    }

    next();
});

export default router;
