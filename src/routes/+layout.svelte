<script>
  import '../app.css';
  import { getFileURL } from '$lib/util.js';

  export let data;
</script>

<div class="navbar bg-base-200 md:px-32 p-4 mb-4">
  <div class="flex-1">
    <img src="/logo.png" alt="The Movement Logo" class="h-12" />
  </div>
  <div class="flex gap-2">
    {#if !data.user}
      <a href="/login" class="link">Inloggen als artiest</a>
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
          {#if data.user?.role === 'admin'}
            <div class="divider mt-0 mb-1">Artiest</div>
          {/if}
          <li>
            <a href="/upload"> Track uploaden </a>
            <a href="/settings"> Instellingen </a>
          </li>
          {#if data.user?.role === 'admin'}
            <div class="divider my-1">Admin</div>
            <li><a href="/admin/new-tracks">Nieuwe tracks</a></li>
            <li><a href="/admin/tracks">Bestaande tracks</a></li>
            <li><a href="/admin/artists">Artiesten</a></li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
</div>

<div class="md:px-32">
  <slot />
</div>
