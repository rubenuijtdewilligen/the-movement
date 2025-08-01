<script>
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { getFileURL } from '$lib/util.js';
  import toast from 'svelte-french-toast';

  export let data;

  let loading;
  $: loading = false;
</script>

<div class="space-y-6">
  <div>
    <a href="/admin/artists" class="link link-primary">⬅️ Terug naar alle artiesten</a>
  </div>

  <div class="bg-base-200 p-4 rounded-sm">
    <div class="flex flex-row items-center space-x-2">
      {#if data.artist.avatar}
        <div class="avatar">
          <div class="h-16 rounded-full">
            <img
              src={getFileURL(data.artist.collectionId, data.artist.id, data.artist.avatar)}
              alt="Artist avatar"
            />
          </div>
        </div>
      {/if}
      <h1 class="text-3xl font-bold">{data.artist.stageName}</h1>
    </div>

    <div class="mt-2">
      <p><span class="font-bold">Naam:</span> {data.artist.fullName}</p>
      <p>
        <span class="font-bold">Account gemaakt op:</span>
        {new Date(data.artist.created)
          .toLocaleString('nl-NL', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          .replace(', ', ' om ')}
      </p>
      <p><span class="font-bold">Tracks geüpload:</span> {data.tracks.length}</p>
    </div>
  </div>

  <div>
    <button
      class="btn btn-error text-white"
      on:click={() => document.getElementById('delete-artist').showModal()}
    >
      Account van {data.artist.stageName} verwijderen
    </button>

    <dialog id="delete-artist" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Account van {data.artist.stageName} verwijderen</h3>

        <p class="mt-2">
          Weet je zeker dat je het account van {data.artist.stageName} wilt verwijderen?
        </p>
        <p class="my-2">
          Je verwijdert hiermee <b>niet</b> automatisch de tracks die deze artiest geüpload heeft.
        </p>
        <p class="mb-4">
          <b>Dit kan niet ongedaan gemaakt worden!</b>
        </p>

        <form
          action="?/deleteArtist"
          method="post"
          class="space-y-4"
          use:enhance={submitDeleteArtist}
        >
          <input type="hidden" name="userId" value={data.artist.id} />

          <button type="submit" class="btn btn-error text-white" disabled={loading}>
            Ja, ik wil het account van {data.artist.stageName} verwijderen
          </button>
        </form>

        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-secondary text-white">Nee, annuleren!</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</div>
