import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
    // Public routes (guest only - redirect to home if logged in)
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

    // Protected routes (require authentication)
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

    // Moderation routes (moderator and admin only)
    {
        path: '/moderation',
        name: 'ModerationDashboard',
        component: () => import('@/views/moderation/Dashboard.vue'),
        meta: { requiresAuth: true, requiresModerator: true },
    },

    // Admin-only routes
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
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfilePage.vue'),
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.user?.role_id === 1;
    const isModerator = authStore.user?.role_id === 3;

    // Guest routes (login/register)
    if (to.meta.guest) {
        if (isAuthenticated) {
            // Already logged in, redirect based on role
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

    // Protected routes
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            // Not logged in, redirect to login
            next('/login');
            return;
        }

        // Check admin access
        if (to.meta.requiresAdmin && !isAdmin) {
            // Not admin, redirect based on role
            next(isModerator ? '/moderation' : '/');
            return;
        }

        // Check moderator access
        if (to.meta.requiresModerator && !isModerator && !isAdmin) {
            // Not moderator or admin, redirect to user home
            next('/');
            return;
        }

        next();
        return;
    }

    next();
});

export default router;
