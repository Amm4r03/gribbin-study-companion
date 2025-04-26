<script>
    import { supabase } from '$lib/supabase';
    import { addToQueue } from '$lib/utils/queue';
    import { createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';

    export let module;
    export let roadmapId;
    export let progress = {};

    const dispatch = createEventDispatcher();

    async function toggleTopic(topicIndex) {
        const updatedProgress = {
            ...progress,
            [topicIndex]: !progress[topicIndex]
        };

        // Dispatch the update immediately for optimistic UI update
        dispatch('updateProgress', {
            moduleOrder: module.order,
            progress: updatedProgress
        });

        // If offline, queue the update
        if (browser && !navigator.onLine) {
            addToQueue({
                type: 'UPDATE_ROADMAP_PROGRESS',
                data: {
                    roadmapId,
                    progress: updatedProgress
                }
            });
            return;
        }

        // If online, try to update directly
        try {
            const { error } = await supabase
                .from('roadmaps')
                .update({ 
                    progress: {
                        ...roadmapProgress,
                        [module.order]: updatedProgress
                    }
                })
                .eq('id', roadmapId);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating progress:', err);
            // Queue the update if the direct update fails
            addToQueue({
                type: 'UPDATE_ROADMAP_PROGRESS',
                data: {
                    roadmapId,
                    progress: updatedProgress
                }
            });
        }
    }

    $: completedCount = Object.values(progress).filter(Boolean).length;
    $: totalTopics = module.keyTopics.length;
    $: progressPercentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;
</script>

<div class="relative rounded-lg border border-gray-200 p-4 hover:border-indigo-200">
    <div class="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
        {module.order}
    </div>
    <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900">{module.title}</h3>
        <p class="mt-1 text-sm text-gray-600">{module.description}</p>
        
        <!-- Progress Bar -->
        <div class="mt-4">
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Progress</span>
                <span class="font-medium text-indigo-600">{completedCount}/{totalTopics}</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-200">
                <div
                    class="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                    style="width: {progressPercentage}%"
                ></div>
            </div>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
            <!-- Learning Objectives -->
            <div>
                <h4 class="text-sm font-medium text-gray-900">Learning Objectives</h4>
                <ul class="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                    {#each module.learningObjectives as objective}
                        <li>{objective}</li>
                    {/each}
                </ul>
            </div>

            <!-- Key Topics with Checkboxes -->
            <div>
                <h4 class="text-sm font-medium text-gray-900">Key Topics</h4>
                <ul class="mt-2 space-y-2">
                    {#each module.keyTopics as topic, index}
                        <li class="flex items-start gap-2">
                            <button
                                on:click={() => toggleTopic(index)}
                                class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border {progress[index] ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}"
                            >
                                {#if progress[index]}
                                    <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 6l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                {/if}
                            </button>
                            <span class="text-sm text-gray-600">
                                {topic}
                                {#if module.resources?.[index]}
                                    <a
                                        href={module.resources[index]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="ml-2 text-indigo-600 hover:text-indigo-500"
                                    >
                                        📺 Watch
                                    </a>
                                {/if}
                            </span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>

        <div class="mt-4 text-sm text-gray-500">
            Estimated Duration: {module.estimatedDuration}
        </div>
    </div>
</div>