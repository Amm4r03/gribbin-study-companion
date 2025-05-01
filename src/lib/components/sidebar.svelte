<script>
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { requestQueue } from '$lib/utils/queue';

  let isSidebarOpen = false;

  const toggleSidebar = () => {
    isSidebarOpen = !isSidebarOpen;
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/courses', label: 'Courses', icon: '📚' },
    { href: '/roadmaps', label: 'Roadmaps', icon: '🗺️' },
    { href: '/flashcards', label: 'Flashcards', icon: '🎴' },
    { href: '/tasks', label: 'Tasks', icon: '📝' },
    { href: '/pomodoro', label: 'Pomodoro', icon: '⏱️' },
    { href: '/study-logs', label: 'Study Logs', icon: '📈' },
    { href: '/analytics', label: 'Analytics', icon: '📊' }
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    goto('/');
  }

  $: pendingChanges = $requestQueue.length;
</script>

<!-- Mobile Toggle Button -->
<button 
  class="fixed top-4 left-4 z-50 md:hidden bg-indigo-600 text-white p-2 rounded-lg"
  on:click={toggleSidebar}
  aria-label="Toggle Sidebar"
>
  {isSidebarOpen ? '✕' : '☰'}
</button>

<!-- Sidebar -->
<aside
  class={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
>
  <!-- Logo/Brand -->
  <div class="flex h-16 items-center justify-center border-b">
    <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:hue-rotate-60 duration-700 bg-clip-text text-transparent">Gribbin</h1>
  </div>

  <!-- Navigation -->
  <nav class="mt-4 px-4">
    {#each navItems as { href, label, icon }}
      <a
        {href}
        class={`mb-2 flex items-center rounded-lg p-3 text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600
          ${$page.url.pathname === href ? 'bg-indigo-50 text-indigo-600' : ''}`}
      >
        <span class="mr-3 text-xl">{icon}</span>
        <span class="font-medium">{label}</span>
      </a>
    {/each}
  </nav>

  <!-- Queue Status -->
  <!-- {#if pendingChanges > 0}
    <div class="rounded-lg bg-yellow-50 p-4 mx-4 my-2">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            {pendingChanges} change{pendingChanges === 1 ? '' : 's'} pending sync
          </p>
        </div>
      </div>
    </div>
  {/if} -->

  <!-- User Section -->
  <div class="absolute bottom-0 w-full border-t p-4">
    <div class="flex items-center">
      <!-- profile icon -->
      <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center select-none">
        <span class="text-sm font-medium text-indigo-600">
          {$user?.email?.[0].toUpperCase()}
        </span>
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium text-gray-700 hover:text-indigo-600">{$user?.email}</p>
        <button 
          class="text-xs text-gray-500 hover:text-indigo-600 hover:cursor-pointer"
          on:click={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</aside>

<!-- Overlay for mobile -->
{#if isSidebarOpen}
  <div
    class="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 md:hidden"
    on:click={toggleSidebar}
  ></div>
{/if}