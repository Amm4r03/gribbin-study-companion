<script>
    import '../app.css';
    import { user } from '$lib/stores/auth';
    import Sidebar from '$lib/components/sidebar.svelte';
    import { page } from '$app/stores';
    import { navigating } from '$app/stores';
    import { onMount } from 'svelte';
    import { initializeRefreshHandlers } from '$lib/utils/refresh';
    import { initializeSync } from '$lib/utils/sync';
    import { browser } from '$app/environment';

    export let data;

    let isOffline = browser ? !navigator.onLine : false;

    // Show loading state during navigation
    $: isLoading = data.loading || $navigating;

    onMount(() => {
        initializeRefreshHandlers();
        initializeSync();

        window.addEventListener('online', () => isOffline = false);
        window.addEventListener('offline', () => isOffline = true);
    });
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Offline Banner -->
    {#if isOffline}
        <div class="fixed inset-x-0 top-0 z-50 bg-yellow-50 p-2">
            <div class="flex items-center justify-center gap-2 text-sm text-yellow-800">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span>You are currently offline. Some features may be limited.</span>
            </div>
        </div>
    {/if}

    <!-- Global Loading Indicator -->
    {#if isLoading}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
            <div class="rounded-lg bg-white p-6 shadow-xl">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p class="mt-4 text-center text-sm font-medium text-gray-600">Loading...</p>
            </div>
        </div>
    {/if}

    <!-- Error Display -->
    {#if data.error}
        <div class="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-red-50 p-4 shadow-lg">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-red-800">{data.error.message}</p>
                </div>
            </div>
        </div>
    {/if}

    <div class="flex {isOffline ? 'mt-10' : ''}">
        {#if $user}
            <Sidebar />
            <main class="flex-1 pb-24 md:ml-64">
                <div class="px-4 py-8">
                    <slot />
                </div>
            </main>
        {:else}
            <main class="flex-1">
                <slot />
            </main>
        {/if}
    </div>
</div>
