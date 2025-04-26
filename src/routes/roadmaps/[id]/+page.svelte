<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabase';
    import { roadmaps } from '$lib/stores/data';
    import { onMount } from 'svelte';
    import RoadmapModule from '$lib/components/RoadmapModule.svelte';
    import StatsFooter from '$lib/components/StatsFooter.svelte';

    let roadmap = null;
    let loading = true;
    let error = null;
    let totalProgress = 0;

    // Find roadmap in cache or fetch from API
    $: {
        const cachedRoadmap = $roadmaps.find(r => r.id === $page.params.id);
        if (cachedRoadmap) {
            roadmap = cachedRoadmap;
            calculateTotalProgress();
            loading = false;
        } else {
            loadRoadmap();
        }
    }

    async function loadRoadmap() {
        try {
            loading = true;
            error = null;
            const { data, error: err } = await supabase
                .from('roadmaps')
                .select(`
                    *,
                    course:courses (
                        title
                    )
                `)
                .eq('id', $page.params.id)
                .single();

            if (err) throw err;
            roadmap = data;
            calculateTotalProgress();
        } catch (err) {
            error = err.message;
            console.error('Error loading roadmap:', err);
        } finally {
            loading = false;
        }
    }

    function calculateTotalProgress() {
        if (!roadmap?.content) return;

        try {
            const content = JSON.parse(roadmap.content);
            let totalTopics = 0;
            let completedTopics = 0;

            content.modules?.forEach(module => {
                totalTopics += module.keyTopics?.length || 0;
                if (roadmap.progress?.[module.order]) {
                    completedTopics += Object.values(roadmap.progress[module.order]).filter(Boolean).length;
                }
            });

            totalProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        } catch (err) {
            console.error('Error calculating progress:', err);
            totalProgress = 0;
        }
    }

    async function handleModuleProgress(event) {
        const { moduleOrder, progress } = event.detail;
        
        try {
            error = null;
            const updatedProgress = {
                ...(roadmap.progress || {}),
                [moduleOrder]: progress
            };

            const { error: err } = await supabase
                .from('roadmaps')
                .update({ progress: updatedProgress })
                .eq('id', roadmap.id);

            if (err) throw err;

            roadmap.progress = updatedProgress;
            calculateTotalProgress();
            
            // Update cache
            roadmaps.update(maps => 
                maps.map(m => m.id === roadmap.id ? { ...m, progress: updatedProgress } : m)
            );
        } catch (err) {
            error = err.message;
            console.error('Error updating progress:', err);
        }
    }
</script>

<div class="space-y-8">
    {#if loading}
        <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
    {:else if error}
        <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error loading roadmap</h3>
                    <p class="mt-2 text-sm text-red-700">{error}</p>
                    <div class="mt-4">
                        <button
                            type="button"
                            on:click={loadRoadmap}
                            class="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {:else if roadmap}
        <!-- Roadmap Header -->
        <div>
            <div class="flex items-start justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">{roadmap.title}</h1>
                    {#if roadmap.course}
                        <p class="mt-1 text-lg text-indigo-600">From: {roadmap.course.title}</p>
                    {/if}
                </div>
                <a
                    href="/roadmaps"
                    class="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    Back to Roadmaps
                </a>
            </div>

            <!-- Overall Progress -->
            <div class="mt-6 rounded-lg bg-white p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-900">Overall Progress</h2>
                    <span class="text-2xl font-bold text-indigo-600">{Math.round(totalProgress)}%</span>
                </div>
                <div class="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                        class="h-full rounded-full bg-indigo-600 transition-all duration-300"
                        style="width: {totalProgress}%"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Modules -->
        {#if roadmap.content}
            {#try}
                {@const content = JSON.parse(roadmap.content)}
                <div class="space-y-8">
                    {#each content.modules as module (module.order)}
                        <RoadmapModule 
                            {module}
                            roadmapId={roadmap.id}
                            progress={roadmap.progress?.[module.order] || {}}
                            on:updateProgress={handleModuleProgress}
                        />
                    {/each}
                </div>
            {:catch err}
                <div class="rounded-md bg-yellow-50 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">Invalid roadmap content</h3>
                            <p class="mt-2 text-sm text-yellow-700">This roadmap's content appears to be corrupted. Try regenerating it from the course page.</p>
                        </div>
                    </div>
                </div>
            {/try}
        {/if}
    {:else}
        <div class="rounded-md bg-yellow-50 p-4">
            <p class="text-sm text-yellow-700">Roadmap not found.</p>
            <a
                href="/roadmaps"
                class="mt-4 inline-block text-sm font-medium text-yellow-800 hover:text-yellow-700"
            >
                Return to Roadmaps
            </a>
        </div>
    {/if}
</div>

<StatsFooter />