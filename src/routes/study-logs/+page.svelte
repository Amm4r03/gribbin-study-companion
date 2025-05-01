<script>
    import { supabase } from '$lib/supabase';
    import { user } from '$lib/stores/auth';
    import { courses } from '$lib/stores/data';
    import { onMount } from 'svelte';

    let loading = false;
    let error = null;
    let activeSession = null;
    let logs = [];
    let showForm = false;

    // Form data
    let title = '';
    let selectedCourseId = '';
    let notes = '';

    // Active session timer
    let timer;
    let elapsedTime = 0;

    function formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    async function loadLogs() {
        try {
            loading = true;
            const { data, error: err } = await supabase
                .from('study_logs')
                .select(`
                    *,
                    course:courses (
                        title
                    )
                `)
                .eq('user_id', $user.id)
                .order('started_at', { ascending: false });

            if (err) throw err;
            logs = data;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function startSession() {
        if (!title) {
            error = "Please enter a session title";
            return;
        }

        try {
            const startTime = new Date();
            
            const { data, error: err } = await supabase
                .from('study_logs')
                .insert({
                    user_id: $user.id,
                    title,
                    course_id: selectedCourseId || null,
                    notes,
                    started_at: startTime.toISOString(),
                    status: 'active'
                })
                .select()
                .single();

            if (err) throw err;

            activeSession = data;
            elapsedTime = 0;
            
            // Start timer
            timer = setInterval(() => {
                elapsedTime++;
            }, 60000); // Update every minute

            // Reset form
            showForm = false;
            title = '';
            selectedCourseId = '';
            notes = '';
        } catch (err) {
            error = err.message;
        }
    }

    async function endSession() {
        if (!activeSession) return;

        try {
            clearInterval(timer);
            const endTime = new Date();

            const { error: err } = await supabase
                .from('study_logs')
                .update({
                    ended_at: endTime.toISOString(),
                    status: 'completed',
                    duration: elapsedTime
                })
                .eq('id', activeSession.id);

            if (err) throw err;

            activeSession = null;
            elapsedTime = 0;
            await loadLogs();
        } catch (err) {
            error = err.message;
        }
    }

    async function deleteLog(id) {
        if (!confirm('Are you sure you want to delete this study log?')) return;
        
        try {
            const { error: err } = await supabase
                .from('study_logs')
                .delete()
                .eq('id', id);

            if (err) throw err;
            logs = logs.filter(log => log.id !== id);
        } catch (err) {
            error = err.message;
        }
    }

    // Check for active session on mount
    onMount(async () => {
        const { data, error: err } = await supabase
            .from('study_logs')
            .select()
            .eq('user_id', $user.id)
            .eq('status', 'active')
            .single();

        if (data) {
            activeSession = data;
            const startTime = new Date(data.started_at);
            elapsedTime = Math.floor((new Date() - startTime) / (1000 * 60));
            
            timer = setInterval(() => {
                elapsedTime++;
            }, 60000);
        }

        await loadLogs();
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Study Logs</h1>
            <p class="mt-1 text-sm text-gray-500">Track your study sessions</p>
        </div>
        <button
            on:click={() => showForm = !showForm}
            disabled={!!activeSession}
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
            {showForm ? 'Cancel' : 'Start Session'}
        </button>
    </div>

    {#if error}
        <div class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-700">{error}</p>
        </div>
    {/if}

    <!-- Active Session -->
    {#if activeSession}
        <div class="rounded-lg bg-indigo-50 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-indigo-900">Active Session</h2>
                    <p class="mt-1 text-sm text-indigo-700">{activeSession.title}</p>
                </div>
                <button
                    on:click={endSession}
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    End Session
                </button>
            </div>
            <div class="mt-4">
                <div class="text-3xl font-bold text-indigo-600">
                    {formatDuration(elapsedTime)}
                </div>
                <p class="mt-2 text-sm text-indigo-700">
                    Started at {formatDateTime(activeSession.started_at)}
                </p>
            </div>
        </div>
    {/if}

    <!-- Session Form -->
    {#if showForm}
        <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900">Start New Session</h2>
            <div class="mt-4 grid gap-6">
                <div>
                    <label for="sessionTitle" class="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        id="sessionTitle"
                        bind:value={title}
                        type="text"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="What are you studying?"
                    />
                </div>

                <div>
                    <label for="sessionCourse" class="block text-sm font-medium text-gray-700">Course (Optional)</label>
                    <select
                        id="sessionCourse"
                        bind:value={selectedCourseId}
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                        <option value="">No course</option>
                        {#each $courses as course}
                            <option value={course.id}>{course.title}</option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label for="sessionNotes" class="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        id="sessionNotes"
                        bind:value={notes}
                        rows="3"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Add any notes or goals for this session..."
                    ></textarea>
                </div>

                <div class="flex justify-end">
                    <button
                        on:click={startSession}
                        disabled={!title}
                        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Study Logs -->
    {#if loading}
        <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
    {:else if logs.length === 0}
        <div class="rounded-lg bg-gray-50 p-8 text-center">
            <h3 class="text-lg font-medium text-gray-900">No study logs yet</h3>
            <p class="mt-2 text-sm text-gray-500">
                Start a new study session to begin tracking your progress.
            </p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each logs as log (log.id)}
                <div class="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div class="absolute right-2 top-2">
                        <button
                            on:click={() => deleteLog(log.id)}
                            class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                            ×
                        </button>
                    </div>

                    <div class="grid gap-4 md:grid-cols-[1fr,auto]">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">{log.title}</h3>
                            {#if log.course}
                                <p class="mt-1 text-sm text-indigo-600">{log.course.title}</p>
                            {/if}
                            {#if log.notes}
                                <p class="mt-2 text-sm text-gray-600">{log.notes}</p>
                            {/if}
                        </div>

                        <div class="text-right">
                            <div class="text-2xl font-semibold text-gray-900">
                                {formatDuration(log.duration || 0)}
                            </div>
                            <p class="mt-1 text-sm text-gray-500">
                                {formatDateTime(log.started_at)}
                            </p>
                            {#if log.ended_at}
                                <p class="text-sm text-gray-500">
                                    to {formatDateTime(log.ended_at)}
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>