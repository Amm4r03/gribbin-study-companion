<script>
    import { roadmaps } from '$lib/stores/data';
    import StatsFooter from '$lib/components/StatsFooter.svelte';

    function calculateProgress(roadmap) {
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

            return totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        } catch (error) {
            console.error('Error calculating progress:', error);
            return 0;
        }
    }

    // Filter out invalid roadmaps
    $: validRoadmaps = $roadmaps.filter(roadmap => {
        try {
            JSON.parse(roadmap.content);
            return true;
        } catch {
            return false;
        }
    });
</script>

<div class="space-y-8">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold text-gray-900">Learning Roadmaps</h1>
        <p class="mt-1 text-sm text-gray-500">Track your progress through course roadmaps</p>
    </div>

    <!-- Roadmaps Grid -->
    {#if !$roadmaps.length}
        <div class="rounded-lg bg-white p-8 text-center">
            <h3 class="text-lg font-medium text-gray-900">No roadmaps yet</h3>
            <p class="mt-2 text-gray-600">Generate a roadmap from your course syllabus to get started.</p>
            <a
                href="/courses"
                class="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
                Go to Courses
            </a>
        </div>
    {:else}
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each validRoadmaps as roadmap (roadmap.id)}
                {@const progress = calculateProgress(roadmap)}
                <a
                    href="/roadmaps/{roadmap.id}"
                    class="group relative block overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div class="relative">
                        <h3 class="text-lg font-semibold text-gray-900">{roadmap.title}</h3>
                        {#if roadmap.course}
                            <p class="mt-1 text-sm text-indigo-600">From: {roadmap.course.title}</p>
                        {/if}

                        <!-- Progress Bar -->
                        <div class="mt-4">
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-600">Progress</span>
                                <span class="font-medium text-indigo-600">{Math.round(progress)}%</span>
                            </div>
                            <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    class="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                    style="width: {progress}%"
                                ></div>
                            </div>
                        </div>

                        <!-- Module Count -->
                        {#if roadmap.content}
                            {@const content = JSON.parse(roadmap.content)}
                            <p class="mt-4 text-sm text-gray-500">
                                {content.modules?.length || 0} modules
                            </p>
                        {/if}

                        <!-- Created Date -->
                        <p class="mt-2 text-xs text-gray-400">
                            Created {new Date(roadmap.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

<StatsFooter />