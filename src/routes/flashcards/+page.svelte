<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    // Function to check if the current route is public
    function isPublicRoute(path) {
        return ['/', '/auth'].includes(path);
    }

    // Redirect to home if not authenticated and not on a public route
    onMount(() => {
        const unsubscribe = user.subscribe(($user) => {
            if (!$user && !isLoading && !isPublicRoute($page.url.pathname)) {
                goto('/');
            }
        });

        return () => unsubscribe();
    });
</script>