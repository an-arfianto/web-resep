export interface User {
    id: number;
    username: string;
    role_id: number;
    role_name?: string;
    created_at?: string;
}

export interface Ingredient {
    name: string;
    quantity?: number | null;
    unit?: string | null;
    display?: string;
}

export interface Recipe {
    id: number;
    name: string;
    category: string;
    description?: string;
    instructions?: string;
    ingredients: Ingredient[] | string;
    ingredientsText?: string;
    user_id?: number;
    creator_username?: string;
    matched_count?: number;
    created_at: string;
    updated_at?: string;
    status?: RecipeStatus;
    rejection_reason?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    role_id: number;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User | User[];
    count?: number;
}

export interface RecipeResponse {
    success: boolean;
    message: string;
    data: Recipe | Recipe[];
    count?: number;
}

export interface SearchCriteria {
    operator: 'AND' | 'OR' | 'NOT';
    ingredients: string[];
    excludedIngredients?: string[];
}

export interface SearchResponse {
    success: boolean;
    message: string;
    operator: string;
    searchedIngredients: string[];
    excludedIngredients?: string[];
    count: number;
    data: Recipe[];
}

export interface CreateRecipeData {
    name: string;
    category: string;
    description?: string;
    instructions: string;
    ingredients: Ingredient[];
}

export type RecipeStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationRecipe {
    id: number;
    name: string;
    category: string;
    status: RecipeStatus;
    created_at: string;
    user_id: number;
    creator_username: string;
    ingredients: string;
    description?: string;
    instructions?: string;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    reviewer_username?: string | null;
    rejection_reason?: string | null;
}

export interface ModerationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface ModerationStatsResponse {
    success: boolean;
    data: ModerationStats;
}

export interface ModerationRecipesResponse {
    success: boolean;
    count: number;
    status?: RecipeStatus;
    data: ModerationRecipe[];
}

export interface ApiError {
    message: string;
    status?: number;
}
