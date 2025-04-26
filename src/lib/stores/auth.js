import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import { createCachedStore } from '$lib/utils/cache';

// Create cached user store
export const user = createCachedStore('user', null, async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
});

export const isLoading = createCachedStore('auth_loading', !browser, async () => false);

// Initialize the store with the current session
supabase.auth.getSession().then(({ data: { session } }) => {
    user.set(session?.user ?? null);
    isLoading.set(false);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    user.set(session?.user ?? null);
    isLoading.set(false);
});