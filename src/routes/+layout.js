import { user, isLoading } from '$lib/stores/auth';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { handleError } from '$lib/utils/errors';

const publicRoutes = ['/', '/auth'];

export const load = async ({ url, error }) => {
    // Handle any errors passed from child routes
    if (error) {
        return {
            error: handleError(error)
        };
    }

    if (get(isLoading)) {
        return {
            loading: true
        };
    }

    const isPublicRoute = publicRoutes.includes(url.pathname);
    const isAuthenticated = !!get(user);

    if (!isPublicRoute && !isAuthenticated) {
        throw redirect(303, '/');
    }

    return {
        user: get(user)
    };
};