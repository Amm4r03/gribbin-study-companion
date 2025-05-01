<script>
    import { user } from '$lib/stores/auth';
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let email = '';
    let password = '';
    let loading = false;
    let error = null;
    let isSignUp = false;

    onMount(() => {
        if ($user) {
            goto('/');
        }
    });

    async function handleAuth() {
        try {
            loading = true;
            error = null;
            
            if (isSignUp) {
                const { error: err } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (err) throw err;
            } else {
                const { error: err } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (err) throw err;
            }
            
            goto('/');
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="fixed inset-0 overflow-hidden">
    <div class="absolute top-1/4 left-1/4 h-96 w-96 animate-blob rounded-full bg-indigo-600 opacity-30 mix-blend-multiply blur-3xl"/>
    <div class="animation-delay-2000 absolute top-1/3 right-1/4 h-96 w-96 animate-blob rounded-full bg-indigo-600 hue-rotate-60 opacity-30 mix-blend-multiply blur-3xl"/>
    <div class="animation-delay-4000 absolute -bottom-8 left-1/2 h-96 w-96 animate-blob rounded-full bg-indigo-300 hue-rotate-90 opacity-30 mix-blend-multiply blur-3xl"/>
</div>

<style>
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    
    .animate-blob {
        animation: blob 7s infinite;
    }
    
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    
    .animation-delay-4000 {
        animation-delay: 4s;
    }
</style>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
        <div class="rounded-2xl bg-white/60 p-8 shadow-lg backdrop-blur-sm">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-gray-900">
                    {isSignUp ? 'Create your account' : 'Sign in to your account'}
                </h2>
                <p class="mt-2 text-sm text-gray-600">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                    <button 
                        on:click={() => isSignUp = !isSignUp}
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </div>

            <form class="mt-8 space-y-6" on:submit|preventDefault={handleAuth}>
                {#if error}
                    <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                {/if}

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <input
                        bind:value={email}
                        type="email"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        bind:value={password}
                        type="password"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
            </form>
        </div>
    </div>
</div>