<template>
    <div
        v-if="totalPages > 1"
        class="flex flex-col gap-4 justify-between items-center mt-6 sm:flex-row"
    >
        <!-- Results Info -->
        <div class="text-sm text-gray-600">
            Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
        </div>

        <!-- Pagination Controls -->
        <div class="flex gap-2 items-center">
            <!-- Previous Button -->
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="flex gap-1 items-center py-2 px-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Previous
            </button>

            <!-- Page Numbers -->
            <div class="flex gap-1">
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="page !== '...' ? goToPage(page as number) : null"
                    :disabled="page === '...'"
                    :class="['min-w-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        page === currentPage
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : page === '...'
                              ? 'cursor-default border-gray-300 bg-white text-gray-400'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                    ]"
                >
                    {{ page }}
                </button>
            </div>

            <!-- Next Button -->
            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="flex gap-1 items-center py-2 px-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
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

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const total = totalPages.value;
    const current = props.currentPage;

    if (total <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);

        if (current <= 3) {
            // Near the beginning
            pages.push(2, 3, 4, '...', total);
        } else if (current >= total - 2) {
            // Near the end
            pages.push('...', total - 3, total - 2, total - 1, total);
        } else {
            // In the middle
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
