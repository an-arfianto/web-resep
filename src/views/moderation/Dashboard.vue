<template>
    <div class="flex flex-col gap-5 py-6 px-5 mx-auto max-w-[1100px]">
        <!-- ── Toast notifications ───────────────────────────────── -->
        <teleport to="body">
            <div class="flex fixed right-5 bottom-5 flex-col gap-2 z-[60]">
                <transition-group
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="opacity-0 translate-y-2"
                    leave-active-class="transition duration-200 ease-in"
                    leave-to-class="opacity-0 translate-y-1"
                >
                    <div
                        v-for="toast in toasts"
                        :key="toast.id"
                        :class="['flex w-[320px] max-w-[calc(100vw-40px)] items-start gap-3 rounded-xl px-4 py-3 shadow-lg',
                            toast.type === 'error' && 'bg-errorSoft border-error/30 text-error border',
                            toast.type === 'success' && 'bg-successSoft border-success/30 text-success border',
                        ]"
                    >
                        <!-- Icon -->
                        <svg
                            v-if="toast.type === 'error'"
                            class="mt-0.5 w-4 h-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <svg
                            v-else
                            class="mt-0.5 w-4 h-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
                        <button
                            @click="removeToast(toast.id)"
                            class="mt-0.5 opacity-60 transition-opacity hover:opacity-100 shrink-0"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                width="14"
                                height="14"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </transition-group>
            </div>
        </teleport>

        <!-- ── Stats Bar ─────────────────────────────────────────── -->
        <div class="flex overflow-hidden rounded-2xl shadow-sm bg-surface max-md:grid max-md:grid-cols-2">
            <div class="flex flex-1 gap-3 items-center py-4 px-5 max-md:border-divider max-md:border-r max-md:border-b">
                <svg
                    class="w-8 h-8 text-primary shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <rect x="18" y="3" width="4" height="18" />
                    <rect x="10" y="8" width="4" height="13" />
                    <rect x="2" y="13" width="4" height="8" />
                </svg>
                <div>
                    <p class="text-3xl font-extrabold leading-none text-textPrimary">
                        {{ moderationStore.stats.total }}
                    </p>
                    <p class="font-semibold tracking-wider uppercase text-textSecondary text-[0.68rem]">Total Resep</p>
                </div>
            </div>
            <div class="my-3.5 w-px bg-divider max-md:hidden"></div>
            <div class="flex flex-1 gap-3 items-center py-4 px-5 max-md:border-divider max-md:border-b">
                <svg
                    class="w-8 h-8 text-warning shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                    <p class="text-3xl font-extrabold leading-none text-warning">{{ moderationStore.stats.pending }}</p>
                    <p class="font-semibold tracking-wider uppercase text-textSecondary text-[0.68rem]">Pending</p>
                </div>
            </div>
            <div class="my-3.5 w-px bg-divider max-md:hidden"></div>
            <div class="flex flex-1 gap-3 items-center py-4 px-5 max-md:border-divider max-md:border-r">
                <svg
                    class="w-8 h-8 text-success shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                    <p class="text-3xl font-extrabold leading-none text-success">
                        {{ moderationStore.stats.approved }}
                    </p>
                    <p class="font-semibold tracking-wider uppercase text-textSecondary text-[0.68rem]">Disetujui</p>
                </div>
            </div>
            <div class="my-3.5 w-px bg-divider max-md:hidden"></div>
            <div class="flex flex-1 gap-3 items-center py-4 px-5">
                <svg
                    class="w-8 h-8 text-error shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <div>
                    <p class="text-3xl font-extrabold leading-none text-error">{{ moderationStore.stats.rejected }}</p>
                    <p class="font-semibold tracking-wider uppercase text-textSecondary text-[0.68rem]">Ditolak</p>
                </div>
            </div>
        </div>

        <!-- ── Main layout ────────────────────────────────────────── -->
        <div class="flex gap-5 items-start max-md:flex-col">
            <!-- Sidebar -->
            <nav
                class="flex sticky top-5 flex-col gap-0.5 p-2 rounded-2xl shadow-sm bg-surface w-[215px] shrink-0 max-md:static max-md:w-full max-md:flex-row"
            >
                <p
                    class="px-3 pt-1 pb-2 font-bold uppercase text-textMuted text-[0.68rem] tracking-[0.08em] max-md:hidden"
                >
                    Moderasi
                </p>

                <button
                    v-for="nav in navItems"
                    :key="nav.key"
                    @click="handleTabChange(nav.key)"
                    :class="['flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        'max-md:flex-1 max-md:flex-col max-md:items-center max-md:gap-1 max-md:py-2.5 max-md:text-[0.72rem]',
                        activeTab === nav.key
                            ? 'bg-overlay text-primary font-bold'
                            : 'text-textSecondary hover:bg-overlay hover:text-textPrimary',
                    ]"
                >
                    <svg
                        class="h-[17px] w-[17px] shrink-0 max-md:h-5 max-md:w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        v-html="nav.icon"
                    ></svg>
                    <span class="max-md:text-center max-md:leading-tight">{{ nav.label }}</span>
                    <span
                        v-if="nav.key === 'pending' && moderationStore.stats.pending > 0"
                        class="inline-flex justify-center items-center px-1 ml-auto h-5 font-bold rounded-full bg-error text-textInverse min-w-[20px] text-[0.65rem] max-md:ml-0"
                    >
                        {{ moderationStore.stats.pending }}
                    </span>
                </button>
            </nav>

            <!-- Content panel -->
            <section class="flex-1 min-w-0 rounded-2xl shadow-sm bg-surface">
                <!-- Loading / error -->
                <div v-if="moderationStore.loading" class="flex justify-center py-16">
                    <div class="loading-spin"></div>
                </div>
                <div v-else-if="moderationStore.error" class="flex flex-col gap-3 items-center py-16">
                    <p class="text-sm text-error">{{ moderationStore.error }}</p>
                    <button
                        @click="moderationStore.fetchStats()"
                        class="py-2 px-5 text-sm font-semibold rounded-lg bg-error text-textInverse"
                    >
                        Coba lagi
                    </button>
                </div>

                <template v-else>
                    <!-- Panel header -->
                    <div class="py-4 px-6 border-b border-divider max-md:px-4">
                        <h2 class="text-base font-bold text-textPrimary">{{ currentNav?.label }}</h2>
                        <p class="mt-0.5 text-xs text-textSecondary">{{ panelSubtitle }}</p>
                    </div>

                    <div class="p-6 max-md:p-4">
                        <!-- ── Pending ─────────── -->
                        <template v-if="activeTab === 'pending'">
                            <div
                                v-if="moderationStore.pendingRecipes.length === 0"
                                class="flex flex-col gap-2 items-center py-14"
                            >
                                <svg
                                    class="mb-1 w-11 h-11 text-textMuted"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="font-bold text-textPrimary">Semua sudah direview</p>
                                <p class="text-sm text-textSecondary">Tidak ada resep pending sementara waktu.</p>
                            </div>
                            <div v-else class="flex flex-col gap-3.5">
                                <PendingRecipeItem
                                    v-for="recipe in paginatedPendingRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @approve="handleApprove"
                                    @reject="handleReject"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="moderationStore.pendingRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPagePending"
                                :total-items="moderationStore.pendingRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangePending"
                            />
                        </template>

                        <!-- ── Reviewed ────────── -->
                        <template v-else-if="activeTab === 'reviewed'">
                            <div v-if="loadingReviewed" class="flex justify-center py-14">
                                <div class="loading-spin"></div>
                            </div>
                            <div
                                v-else-if="reviewedRecipes.length === 0"
                                class="flex flex-col gap-2 items-center py-14"
                            >
                                <svg
                                    class="mb-1 w-11 h-11 text-textMuted"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <p class="font-bold text-textPrimary">Belum ada review</p>
                                <p class="text-sm text-textSecondary">Anda belum mereview resep apapun.</p>
                            </div>
                            <div v-else class="flex flex-col gap-3.5">
                                <ReviewedRecipeItem
                                    v-for="recipe in paginatedReviewedRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="reviewedRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPageReviewed"
                                :total-items="reviewedRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangeReviewed"
                            />
                        </template>

                        <!-- ── All ────────────── -->
                        <template v-else-if="activeTab === 'all'">
                            <div v-if="loadingAll" class="flex justify-center py-14">
                                <div class="loading-spin"></div>
                            </div>
                            <div
                                v-else-if="moderationStore.allRecipes.length === 0"
                                class="flex flex-col gap-2 items-center py-14"
                            >
                                <svg
                                    class="mb-1 w-11 h-11 text-textMuted"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                                <p class="font-bold text-textPrimary">Tidak ada resep</p>
                            </div>
                            <div v-else class="flex flex-col gap-3.5">
                                <ReviewedRecipeItem
                                    v-for="recipe in paginatedAllRecipes"
                                    :key="recipe.id"
                                    :recipe="recipe"
                                    @view-detail="openRecipeDetail"
                                />
                            </div>
                            <Pagination
                                v-if="moderationStore.allRecipes.length > itemsPerPage"
                                class="mt-4"
                                :current-page="currentPageAll"
                                :total-items="moderationStore.allRecipes.length"
                                :items-per-page="itemsPerPage"
                                @page-change="handlePageChangeAll"
                            />
                        </template>
                    </div>
                </template>
            </section>
        </div>

        <!-- ── Detail Modal ──────────────────────────────────────── -->
        <teleport to="body">
            <transition
                enter-active-class="transition duration-200 ease-out [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-out"
                enter-from-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
                leave-active-class="transition duration-200 ease-in [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-in"
                leave-to-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
            >
                <div
                    v-if="showDetailModal && selectedRecipe"
                    class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                    style="background: rgba(0, 0, 0, 0.45)"
                    @click.self="closeDetailModal"
                >
                    <div
                        class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-h-[88vh] max-w-[640px]"
                    >
                        <!-- Header -->
                        <div
                            class="flex gap-3 justify-between items-start py-4 px-6 border-b border-divider bg-background shrink-0"
                        >
                            <div class="flex-1 min-w-0">
                                <h2 class="mb-2 text-lg font-bold text-textPrimary">{{ selectedRecipe.name }}</h2>
                                <div class="flex flex-wrap gap-1.5">
                                    <span class="category-badges">{{ selectedRecipe.category }}</span>
                                    <span :class="['status-badges', statusBadgeClass(selectedRecipe.status)]">{{
                                        getStatusText(selectedRecipe.status)
                                    }}</span>
                                </div>
                            </div>
                            <button
                                @click="closeDetailModal"
                                aria-label="Tutup"
                                class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary shrink-0 hover:bg-overlay hover:text-textPrimary"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    width="17"
                                    height="17"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <!-- Body -->
                        <div class="flex overflow-y-auto flex-col flex-1 gap-5 py-5 px-6">
                            <div class="flex flex-col gap-1.5 py-3 px-4 rounded-lg bg-background">
                                <div class="flex gap-2 text-sm">
                                    <span class="w-20 font-semibold text-textSecondary shrink-0">Oleh</span
                                    ><span class="text-textPrimary">{{ selectedRecipe.creator_username }}</span>
                                </div>
                                <div class="flex gap-2 text-sm">
                                    <span class="w-20 font-semibold text-textSecondary shrink-0">Dibuat</span
                                    ><span class="text-textPrimary">{{ formatDate(selectedRecipe.created_at) }}</span>
                                </div>
                                <div v-if="selectedRecipe.reviewed_at" class="flex gap-2 text-sm">
                                    <span class="w-20 font-semibold text-textSecondary shrink-0">Direview</span>
                                    <span class="text-textPrimary"
                                        >{{ formatDate(selectedRecipe.reviewed_at)
                                        }}<span v-if="selectedRecipe.reviewer_username" class="text-textSecondary">
                                            oleh {{ selectedRecipe.reviewer_username }}</span
                                        ></span
                                    >
                                </div>
                            </div>
                            <div v-if="selectedRecipe.description">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Deskripsi</p>
                                <p class="text-sm leading-relaxed text-textSecondary">
                                    {{ selectedRecipe.description }}
                                </p>
                            </div>
                            <div v-if="selectedRecipe.ingredients">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Bahan-bahan</p>
                                <p class="text-sm leading-relaxed whitespace-pre-line text-textSecondary">
                                    {{ selectedRecipe.ingredients }}
                                </p>
                            </div>
                            <div v-if="selectedRecipe.instructions">
                                <p class="mb-1.5 text-sm font-bold text-textPrimary">Instruksi</p>
                                <p class="text-sm leading-relaxed whitespace-pre-line text-textSecondary">
                                    {{ selectedRecipe.instructions }}
                                </p>
                            </div>
                            <div
                                v-if="selectedRecipe.status === 'rejected' && selectedRecipe.rejection_reason"
                                class="py-3 px-4 rounded-lg border-error bg-errorSoft border-l-[3px]"
                            >
                                <p class="flex gap-1.5 items-center mb-1 text-sm font-bold text-error">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        width="14"
                                        height="14"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    Alasan Penolakan
                                </p>
                                <p class="text-sm leading-relaxed text-error">{{ selectedRecipe.rejection_reason }}</p>
                            </div>
                        </div>
                        <!-- Footer (pending only) -->
                        <div
                            v-if="selectedRecipe.status === 'pending'"
                            class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background shrink-0"
                        >
                            <button
                                @click="handleApproveFromModal(selectedRecipe.id)"
                                :disabled="modalActionLoading"
                                class="inline-flex gap-1.5 items-center py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-successSoft text-success hover:bg-success hover:text-textInverse"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    width="14"
                                    height="14"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {{ modalActionLoading ? 'Mohon Tunggu...' : 'Setujui' }}
                            </button>
                            <button
                                @click="openRejectModal"
                                :disabled="modalActionLoading"
                                class="inline-flex gap-1.5 items-center py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-errorSoft text-error hover:bg-error hover:text-textInverse"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    width="14"
                                    height="14"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </teleport>

        <!-- ── Reject reason modal ───────────────────────────────── -->
        <teleport to="body">
            <transition
                enter-active-class="transition duration-200 ease-out [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-out"
                enter-from-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
                leave-active-class="transition duration-200 ease-in [&_.mpanel]:transition [&_.mpanel]:duration-200 [&_.mpanel]:ease-in"
                leave-to-class="opacity-0 [&_.mpanel]:translate-y-2.5 [&_.mpanel]:opacity-0"
            >
                <div
                    v-if="showRejectModal"
                    class="flex fixed inset-0 z-50 justify-center items-center p-5 backdrop-blur-sm"
                    style="background: rgba(0, 0, 0, 0.45)"
                    @click.self="closeRejectModal"
                >
                    <div
                        class="flex overflow-hidden flex-col w-full rounded-2xl shadow-2xl mpanel bg-surface max-w-[460px]"
                    >
                        <div
                            class="flex gap-3 justify-between items-center py-4 px-6 border-b border-divider bg-background"
                        >
                            <h2 class="text-base font-bold text-textPrimary">Tolak Resep</h2>
                            <button
                                @click="closeRejectModal"
                                aria-label="Tutup"
                                class="flex justify-center items-center w-8 h-8 rounded-lg transition-colors text-textSecondary shrink-0 hover:bg-overlay hover:text-textPrimary"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    width="17"
                                    height="17"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2.5 py-5 px-6">
                            <p class="text-sm text-textSecondary">
                                Berikan alasan agar pembuat resep dapat memperbaikinya.
                            </p>
                            <textarea
                                v-model="rejectionReason"
                                rows="5"
                                placeholder="Contoh: Bahan-bahan tidak lengkap, instruksi kurang jelas, dll."
                                :disabled="modalActionLoading"
                                :class="['input-field resize-y text-sm',
                                    showRejectError && 'border-error focus:ring-error',
                                ]"
                            ></textarea>
                            <p v-if="showRejectError" class="text-xs text-error">Mohon berikan alasan penolakan</p>
                        </div>
                        <div class="flex gap-2.5 justify-end py-4 px-6 border-t border-divider bg-background">
                            <button
                                @click="closeRejectModal"
                                :disabled="modalActionLoading"
                                class="py-2 px-5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-overlay text-textSecondary hover:bg-divider hover:text-textPrimary"
                            >
                                Batal
                            </button>
                            <button
                                @click="handleRejectFromModal"
                                :disabled="modalActionLoading"
                                class="py-2 px-5 text-sm font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-error text-textInverse hover:opacity-85"
                            >
                                {{ modalActionLoading ? 'Mohon Tunggu...' : 'Tolak Resep' }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useModerationStore } from '@/stores/moderationStore';
import { useAuthStore } from '@/stores/authStore';
import PendingRecipeItem from '@/components/moderation/PendingRecipeItem.vue';
import ReviewedRecipeItem from '@/components/moderation/ReviewedRecipeItem.vue';
import Pagination from '@/components/Pagination.vue';
import type { ModerationRecipe } from '@/types';

const moderationStore = useModerationStore();
const authStore = useAuthStore();

type TabKey = 'pending' | 'reviewed' | 'all';

// ── Toast system ──────────────────────────────────────────────
interface Toast {
    id: number;
    type: 'success' | 'error';
    message: string;
}
const toasts = ref<Toast[]>([]);
let toastId = 0;

function showToast(type: Toast['type'], message: string, duration = 4000) {
    const id = ++toastId;
    toasts.value.push({ id, type, message });
    setTimeout(() => removeToast(id), duration);
}

function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}

// ── Nav items ─────────────────────────────────────────────────
const navItems: { key: TabKey; label: string; icon: string }[] = [
    {
        key: 'pending',
        label: 'Review Pending',
        icon: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    },
    {
        key: 'reviewed',
        label: 'Review Saya',
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    },
    {
        key: 'all',
        label: 'Semua Resep',
        icon: '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
    },
];

const activeTab = ref<TabKey>('pending');
const currentNav = computed(() => navItems.find((n) => n.key === activeTab.value));
const panelSubtitle = computed(
    () =>
        ({
            pending: `${moderationStore.pendingRecipes.length} resep menunggu review`,
            reviewed: `${reviewedRecipes.value.length} resep telah Anda review`,
            all: `${moderationStore.allRecipes.length} total resep terdaftar`,
        })[activeTab.value]
);

// ── Tab cache ─────────────────────────────────────────────────
const reviewedRecipes = ref<ModerationRecipe[]>([]);
const reviewedLoaded = ref(false);
const loadingReviewed = ref(false);
const allLoaded = ref(false);
const loadingAll = ref(false);

// ── Modals ────────────────────────────────────────────────────
const showDetailModal = ref(false);
const showRejectModal = ref(false);
const selectedRecipe = ref<ModerationRecipe | null>(null);
const rejectionReason = ref('');
const showRejectError = ref(false);
const modalActionLoading = ref(false);

// ── Pagination ────────────────────────────────────────────────
const currentPagePending = ref(1);
const currentPageReviewed = ref(1);
const currentPageAll = ref(1);
const itemsPerPage = 10;

const currentUserId = computed(() => authStore.user?.id);

const paginatedPendingRecipes = computed(() => {
    const s = (currentPagePending.value - 1) * itemsPerPage;
    return moderationStore.pendingRecipes.slice(s, s + itemsPerPage);
});
const paginatedReviewedRecipes = computed(() => {
    const s = (currentPageReviewed.value - 1) * itemsPerPage;
    return reviewedRecipes.value.slice(s, s + itemsPerPage);
});
const paginatedAllRecipes = computed(() => {
    const s = (currentPageAll.value - 1) * itemsPerPage;
    return moderationStore.allRecipes.slice(s, s + itemsPerPage);
});

onMounted(async () => {
    await moderationStore.fetchStats();
    await moderationStore.fetchPendingRecipes();
});

async function handleTabChange(tab: TabKey) {
    activeTab.value = tab;
    if (tab === 'reviewed' && !reviewedLoaded.value) {
        loadingReviewed.value = true;
        try {
            await moderationStore.fetchAllRecipes();
            rebuildReviewedCache();
            reviewedLoaded.value = true;
        } finally {
            loadingReviewed.value = false;
        }
    }
    if (tab === 'all' && !allLoaded.value) {
        loadingAll.value = true;
        try {
            await moderationStore.fetchAllRecipes();
            allLoaded.value = true;
        } finally {
            loadingAll.value = false;
        }
    }
}

function rebuildReviewedCache() {
    const uid = Number(currentUserId.value);
    reviewedRecipes.value = moderationStore.allRecipes.filter(
        (r) => Number(r.reviewed_by) === uid && r.status !== 'pending'
    );
}

function openRecipeDetail(recipe: ModerationRecipe) {
    selectedRecipe.value = recipe;
    showDetailModal.value = true;
}
function closeDetailModal() {
    showDetailModal.value = false;
    selectedRecipe.value = null;
}
function openRejectModal() {
    rejectionReason.value = '';
    showRejectError.value = false;
    showRejectModal.value = true;
}
function closeRejectModal() {
    if (modalActionLoading.value) return;
    showRejectModal.value = false;
    rejectionReason.value = '';
    showRejectError.value = false;
}

function invalidateCaches() {
    reviewedLoaded.value = false;
    allLoaded.value = false;
}

// ── Actions — catch backend errors and show toast ─────────────
async function handleApprove(recipeId: number) {
    try {
        const success = await moderationStore.approveRecipe(recipeId);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil disetujui.');
            if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) currentPagePending.value--;
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menyetujui resep.');
    }
}

async function handleReject(data: { recipeId: number; reason: string }) {
    try {
        const success = await moderationStore.rejectRecipe(data.recipeId, data.reason);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil ditolak.');
            if (paginatedPendingRecipes.value.length === 0 && currentPagePending.value > 1) currentPagePending.value--;
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menolak resep.');
    }
}

async function handleApproveFromModal(recipeId: number) {
    modalActionLoading.value = true;
    try {
        const success = await moderationStore.approveRecipe(recipeId);
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil disetujui.');
            closeDetailModal();
        }
    } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menyetujui resep.');
    } finally {
        modalActionLoading.value = false;
    }
}

async function handleRejectFromModal() {
    if (!rejectionReason.value.trim()) {
        showRejectError.value = true;
        return;
    }
    modalActionLoading.value = true;
    try {
        const success = await moderationStore.rejectRecipe(selectedRecipe.value!.id, rejectionReason.value.trim());
        if (success) {
            invalidateCaches();
            showToast('success', 'Resep berhasil ditolak.');
            closeRejectModal();
            closeDetailModal();
        }
    } catch (err: any) {
        // Backend "cannot review own recipe" error surfaces here as a toast — not a page error
        showToast('error', err?.response?.data?.message ?? err.message ?? 'Gagal menolak resep.');
        closeRejectModal();
    } finally {
        modalActionLoading.value = false;
    }
}

function statusBadgeClass(status: string) {
    return (
        {
            approved: 'bg-successSoft text-success',
            pending: 'bg-warningSoft text-warning',
            rejected: 'bg-errorSoft text-error',
        }[status] ?? 'bg-warningSoft text-warning'
    );
}
function getStatusText(status: string) {
    return { approved: 'Disetujui', pending: 'Pending', rejected: 'Ditolak' }[status] ?? status;
}
function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}
function handlePageChangePending(page: number) {
    currentPagePending.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function handlePageChangeReviewed(page: number) {
    currentPageReviewed.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function handlePageChangeAll(page: number) {
    currentPageAll.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>
