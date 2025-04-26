<script>
    import { userStats } from '$lib/stores/data';
</script>

<footer class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:ml-64">
    <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
            <!-- Pending Tasks -->
            <div class="text-center">
                <dt class="text-sm font-medium text-gray-500">Pending Tasks</dt>
                <dd class="mt-1 text-xl font-semibold tracking-tight text-indigo-600">{$userStats.pendingTasks}</dd>
            </div>

            <!-- Hours Studied Today -->
            <div class="text-center">
                <dt class="text-sm font-medium text-gray-500">Hours Today</dt>
                <dd class="mt-1 text-xl font-semibold tracking-tight text-indigo-600">{$userStats.hoursToday}</dd>
            </div>

            <!-- Completed Tasks Today -->
            <div class="text-center">
                <dt class="text-sm font-medium text-gray-500">Tasks Completed Today</dt>
                <dd class="mt-1 text-xl font-semibold tracking-tight text-indigo-600">{$userStats.completedTasks}</dd>
            </div>

            <!-- Active Courses -->
            <div class="text-center">
                <dt class="text-sm font-medium text-gray-500">Active Courses</dt>
                <dd class="mt-1 text-xl font-semibold tracking-tight text-indigo-600">{$userStats.activeCourses}</dd>
            </div>
        </div>
    </div>
</footer>

<!-- Add padding to main content to prevent overlap with fixed footer -->
<div class="h-24"></div>