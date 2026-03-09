import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
    // login register
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

    // protected routes
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
        meta: { requiresAuth: true },
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/Search.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/recipe/:id',
        name: 'RecipeDetail',
        component: () => import('@/views/RecipeDetail.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/my-recipes',
        name: 'MyRecipes',
        component: () => import('@/views/MyRecipes.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/create-recipe',
        name: 'CreateRecipe',
        component: () => import('@/views/CreateRecipe.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/edit-recipe/:id',
        name: 'EditRecipe',
        component: () => import('@/views/EditRecipe.vue'),
        meta: { requiresAuth: true },
    },

    {
        path: '/moderation',
        name: 'ModerationDashboard',
        component: () => import('@/views/moderation/Dashboard.vue'),
        meta: { requiresAuth: true, requiresModerator: true },
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

// navigation guard
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();
    if (authStore.token && !authStore.user) {
        await authStore.checkAuth();
    }

    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.user?.role_id === 1;
    const isModerator = authStore.user?.role_id === 2;

    // guest routes (belum login)
    if (to.meta.guest) {
        if (isAuthenticated) {
            if (isAdmin) {
                next('/admin');
            } else if (isModerator) {
                next('/moderation');
            } else {
                next('/');
            }
        } else {
            next();
        }
        return;
    }

    // protected routes
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            next('/login');
            return;
        }

        if (to.meta.requiresAdmin && !isAdmin) {
            next(isModerator ? '/moderation' : '/');
            return;
        }

        if (to.meta.requiresModerator && !isModerator && !isAdmin) {
            next('/');
            return;
        }

        next();
        return;
    }

    next();
});

export default router;
