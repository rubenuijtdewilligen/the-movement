<script>
  import '../app.css';
  import { getFileURL } from '$lib/util.js';
  import { page } from '$app/stores';
  import { Toaster } from 'svelte-french-toast';

  export let data;

  $: currentPath = $page.url.pathname;
</script>

<Toaster />

<div class="navbar bg-base-200 md:px-32 p-4 mb-4">
  <div class="flex-1">
    <img src="/logo.png" alt="The Movement Logo" class="h-12" />
  </div>
  <div class="flex gap-2">
    {#if !data.user}
      {#if !(currentPath === '/login' || currentPath.startsWith('/invite'))}
        <a href="/login" class="link">Login as Artist</a>
      {/if}
    {:else}
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="avatar hover:cursor-pointer">
          <div class="h-12 rounded-full">
            <img
              src={data.user?.avatar
                ? getFileURL(data.user?.collectionId, data.user?.id, data.user?.avatar)
                : `https://ui-avatars.com/api/?name=${data.user?.stageName}`}
              alt="User avatar"
            />
          </div>
        </div>
        <ul class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
          <div class="divider mt-0 mb-1">Artist</div>
          <li>
            <a href="/upload"> Upload Track </a>
          </li>

          {#if data.user?.role === 'admin'}
            <div class="divider my-1">Admin</div>
            <li><a href="/admin/mass-upload">Mass Upload</a></li>
            <li><a href="/admin/new-tracks">New Tracks</a></li>
            <li><a href="/admin/tracks">Existing Tracks</a></li>
            <li><a href="/admin/artists">Artists</a></li>
          {/if}

          <div class="divider mt-0 mb-1">Account</div>

          <li><a href="/settings"> Settings </a></li>
          <li>
            <form action="/logout" method="POST">
              <button class="hover:cursor-pointer"> Logout </button>
            </form>
          </li>
        </ul>
      </div>
    {/if}
  </div>
</div>

<div class="md:px-32 px-2">
  <slot />
</div>
