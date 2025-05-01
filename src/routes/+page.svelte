<script>
    import Sidebar from "$lib/components/sidebar.svelte";
    import { user } from '$lib/stores/auth';
    import { supabase } from '$lib/supabase';
    import { goto } from "$app/navigation";
    import LandingFeatureCard from "$lib/components/landingFeatureCard.svelte";
    import Button from "$lib/components/Button.svelte";

    let features = 
        [
            {
                title: "Smart Course Management",
                alt_title: "Course Management",
                description: "Organize your courses, syllabi, and materials in one place with AI-powered insights.",
                icon: "📚",
                href: "/courses"
            },
            {
                title: "AI Learning Roadmaps",
                alt_title: "Your Roadmaps",
                description: "Generate personalized study paths from your course materials and track your progress.",
                icon: "🗺️",
                href: "/roadmaps"
            },
            {
                title: "Smart Study Timer",
                alt_title: "Pomodoro Timer",
                description: "Stay focused with our Pomodoro timer and get insights into your study patterns.",
                icon: "⏱️",
                href: "/pomodoro"
            },
            {
                title: "Intelligent Flashcards",
                alt_title: "Your Flashcards",
                description: "Create and review flashcards with AI-generated questions to enhance retention.",
                icon: "🧠",
                href: "/flashcards"
            },
            {
                title: "Productivity Analytics",
                alt_title: "Your Analytics",
                description: "Get insights into your study habits and improve your productivity over time.",
                icon: "📊",
                href: "/analytics"
            },
            {
                title : "Task Management",
                alt_title: "Your Tasks",
                description: "Organize your tasks and assignments with a built-in task manager.",
                icon: "📝",
                href: "/tasks"
            }
        ];

    let email = '';
    let password = '';
    let loading = false;
    let error = null;

    async function signIn() {
        try {
            loading = true;
            const { error: err } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (err) throw err;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function signUp() {
        try {
            loading = true;
            const { error: err } = await supabase.auth.signUp({
                email,
                password
            });
            if (err) throw err;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

{#if !$user}
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <!-- Hero Section -->
        <div class="relative overflow-hidden">
            <!-- Decorative background -->
            <div class="absolute inset-0 z-0">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </div>

            <div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                        Gribbin
                        <span class="mt-4 block bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-60 duration-700 bg-clip-text text-transparent">
                            Your AI-Powered Learning Companion
                        </span>
                    </h1>
                    <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                        Transform your learning experience with smart course management, 
                        AI-generated study roadmaps, intelligent flashcards, and productivity analytics.
                    </p>
                    <div class="mt-10 flex items-center justify-center gap-x-6">
                        <Button href={'/auth'} variant=primary text="Get Started" />
                        <Button href={'#features'} variant=secondary text="Explore features" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div id="features" class="py-24">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    {#each features as feature}
                        <LandingFeatureCard title = {feature.title} description = {feature.description} icon = {feature.icon} />
                    {/each}
                </div>
            </div>
        </div>

        <!-- simple footer for landing page -->
        <footer class="text-indigo-500 py-6">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p class="mt-4 block bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-60 duration-700 bg-clip-text text-transparent text-center select-none font-normal"><b class="font-semibold">Gribbin</b> | made with &hearts; by Ammar | {new Date().getFullYear()}</p>
            </div>
    </div>
{:else}
<!-- landing screen when the user signs in -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Welcome back!</h1>
        <p class="mt-2 text-gray-600">Continue your learning journey from where you left off.</p>
        <div class="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {#each features as ft}
                <button class="hover:cursor-pointer" onclick={goto(ft.href)}>
                    <LandingFeatureCard title={ft.alt_title} icon={ft.icon}/>
                </button>
            {/each}
        </div>
    </div>
{/if}