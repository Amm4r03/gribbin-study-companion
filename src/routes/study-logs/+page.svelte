<script>
    import { supabase } from '$lib/supabase';
    import { user } from '$lib/stores/auth';
    import { courses } from '$lib/stores/data';
    import { onMount } from 'svelte';

    let loading = false;
    let error = null;
    let logs = [];

    // Form data for manual entry
    let title = '';
    let selectedCourseId = '';
    let notes = '';
    let duration = '';
    let manualDate = new Date().toISOString().split('T')[0];
    let tags = [];
    let tagsInput = '';

    function formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function handleTagInput(e) {
        const input = e.target.value;
        if (input.endsWith(',')) {
            const newTag = input.slice(0, -1).trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                tags = [...tags, newTag];
            }
            tagsInput = '';
        }
    }

    function removeTag(tagToRemove) {
        tags = tags.filter(tag => tag !== tagToRemove);
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
                .order('date', { ascending: false });

            if (err) throw err;
            logs = data;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function submitManualEntry() {
        if (!title || !duration) {
            error = "Please enter both title and duration";
            return;
        }

        try {
            const { data, error: err } = await supabase
                .from('study_logs')
                .insert({
                    user_id: $user.id,
                    title,
                    course_id: selectedCourseId || null,
                    notes,
                    // started_at: new Date(manualDate).toISOString(),
                    // ended_at: new Date(manualDate).toISOString(),
                    duration: parseInt(duration),
                    date: new Date().toISOString(),
                    // status: 'completed',
                    tags,
                    // type: 'manual'
                })
                .select()
                .single();

            if (err) throw err;

            // Reset form
            title = '';
            selectedCourseId = '';
            notes = '';
            duration = '';
            tags = [];
            tagsInput = '';
            
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

    onMount(loadLogs);
</script>

<div class="p-6 max-w-7xl mx-auto space-y-8">
    <div>
        <h1 class="text-3xl font-bold text-gray-900">Study Logs</h1>
        <p class="mt-1 text-sm text-gray-500">Track and manage your study sessions</p>
    </div>

    {#if error}
        <div class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-700">{error}</p>
        </div>
    {/if}

    <!-- Manual Entry Form -->
    <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">Log Study Session</h2>
        <div class="space-y-4">
            <div>
                <label for="manualTitle" class="block text-sm font-medium text-gray-700">Title</label>
                <input
                    id="manualTitle"
                    bind:value={title}
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="What did you study?"
                />
            </div>

            <div>
                <label for="manualDuration" class="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                    id="manualDuration"
                    bind:value={duration}
                    type="number"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="How long did you study?"
                />
            </div>

            <div>
                <label for="manualDate" class="block text-sm font-medium text-gray-700">Date</label>
                <input
                    id="manualDate"
                    bind:value={manualDate}
                    type="date"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label for="manualCourse" class="block text-sm font-medium text-gray-700">Course (Optional)</label>
                <select
                    id="manualCourse"
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
                <label class="block text-sm font-medium text-gray-700">Tags</label>
                <input
                    type="text"
                    bind:value={tagsInput}
                    on:input={handleTagInput}
                    placeholder="Add tags (comma separated)"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <div class="flex flex-wrap gap-2 mt-2">
                    {#each tags as tag}
                        <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm flex items-center">
                            {tag}
                            <button
                                type="button"
                                on:click={() => removeTag(tag)}
                                class="ml-1 text-indigo-600 hover:text-indigo-800"
                            >×</button>
                        </span>
                    {/each}
                </div>
            </div>

            <div>
                <label for="manualNotes" class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                    id="manualNotes"
                    bind:value={notes}
                    rows="3"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Add any notes about your study session..."
                ></textarea>
            </div>

            <button
                on:click={submitManualEntry}
                class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
                Log Study Session
            </button>
        </div>
    </div>

    <!-- Recent Logs -->
    <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Study Sessions</h2>
        
        {#if loading}
            <div class="flex items-center justify-center py-12">
                <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
        {:else if logs.length === 0}
            <div class="rounded-lg bg-gray-50 p-8 text-center">
                <h3 class="text-lg font-medium text-gray-900">No study logs yet</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Start tracking your study sessions to see them here.
                </p>
            </div>
        {:else}
            <div class="space-y-4">
                {#each logs.slice(0, 15) as log (log.id)}
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
                                {#if log.tags && log.tags.length > 0}
                                    <div class="mt-2 flex flex-wrap gap-2">
                                        {#each log.tags as tag}
                                            <span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                                                {tag}
                                            </span>
                                        {/each}
                                    </div>
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
                                    {formatDateTime(log.date)}
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>