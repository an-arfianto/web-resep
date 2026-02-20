<template>
    <div v-if="totalPages > 1" class="flex flex-col gap-4 justify-between items-center mt-6 sm:flex-row">
        <!-- info pagination -->
        <div class="text-sm text-textPrimary">Menampilkan {{ startItem }} - {{ endItem }}, total {{ totalItems }}</div>

        <!-- control pagination -->
        <div class="flex gap-2 items-center">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="flex gap-1 disabled:opacity-50 disabled:cursor-not-allowed button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div class="flex gap-1">
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="page !== '...' ? goToPage(page as number) : null"
                    :disabled="page === '...'"
                    :class="['min-w-10 rounded-lg border px-2 py-1 text-sm font-medium transition-colors',
                        page === currentPage
                            ? 'bg-surface border-border text-textMuted'
                            : page === '...'
                              ? 'text- border-border bg-textSecondary cursor-default'
                              : 'border-border bg-surface text-textPrimary hover:bg-overlay',
                    ]"
                >
                    {{ page }}
                </button>
            </div>

            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="flex gap-1 disabled:opacity-50 disabled:cursor-not-allowed button bg-primarySoft text-primary hover:bg-primary hover:text-textInverse"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
}

interface Emits {
    (e: 'page-change', page: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const startItem = computed(() => {
    if (props.totalItems === 0) return 0;
    return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
    const end = props.currentPage * props.itemsPerPage;
    return end > props.totalItems ? props.totalItems : end;
});

// generate angka pagination
const visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const total = totalPages.value;
    const current = props.currentPage;

    if (total <= 7) {
        // tampilkan semua angka jika pagination <= 7
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (current <= 3) {
            // dekat page 1
            pages.push(2, 3, 4, '...', total);
        } else if (current >= total - 2) {
            // dekat page akhir
            pages.push('...', total - 3, total - 2, total - 1, total);
        } else {
            // tengah pagination
            pages.push('...', current - 1, current, current + 1, '...', total);
        }
    }

    return pages;
});

function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        emit('page-change', page);
    }
}
</script>
