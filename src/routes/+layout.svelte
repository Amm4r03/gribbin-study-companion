<script>
    import '../app.css';
    import { page } from '$app/stores';
    import Navbar from '$lib/components/navbar.svelte';
    import Sidebar from '$lib/components/sidebar.svelte';
    import StatsFooter from '$lib/components/StatsFooter.svelte';

    let {
        data
    } = $props();

    let { loading, user, error } = $derived(data);
    
    // Show sidebar only on authenticated routes except landing page
    let showSidebar = $derived(user && $page.url.pathname !== '/');
</script>

{#if loading}
    <div class="flex min-h-screen items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
    </div>
{:else if error}
    <div class="flex min-h-screen flex-col">
        <main class="flex-1 p-4">
            <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error</h3>
                        <p class="mt-2 text-sm text-red-700">{error.message}</p>
                    </div>
                </div>
            </div>
        </main>
    </div>
{:else}
    <div class="flex min-h-screen flex-col">
        {#if user}
            <Sidebar />
            <main class="flex-1 pb-24 md:ml-64">
                <div class="px-4 py-8">
                    <slot />
                </div>
                <StatsFooter />
            </main>
        {:else}
            <main class="flex-1">
                <slot />
            </main>
        {/if}
    </div>
{/if}