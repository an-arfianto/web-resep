export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export const recipeCategory = [
    'Masakan Utama',
    'Makanan Pembuka',
    'Makanan Penutup',
    'Salad',
    'Kue',
    'Sup',
    'Minuman',
    'Cemilan',
] as const;

export const unitIng = [
    { value: 'g', label: 'g (gram)' },
    { value: 'kg', label: 'kg (kilogram)' },
    { value: 'ml', label: 'ml (mililiter)' },
    { value: 'l', label: 'l (liter)' },
    { value: 'cup', label: 'cup (cangkir)' },
    { value: 'sdm', label: 'sdm (sendok makan)' },
    { value: 'sdt', label: 'sdt (sendok teh)' },
    { value: 'butir', label: 'butir' },
    { value: 'buah', label: 'buah' },
    { value: 'siung', label: 'siung' },
    { value: 'batang', label: 'batang' },
    { value: 'lembar', label: 'lembar' },
    { value: 'potong', label: 'potong' },
    { value: 'jumput', label: 'jumput' },
    { value: 'secukupnya', label: 'secukupnya' },
] as const;

export type RecipeCategory = (typeof recipeCategory)[number];
export type IngredientUnit = (typeof unitIng)[number]['value'];
