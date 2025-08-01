<script>
  import WaveSurfer from 'wavesurfer.js';
  import { onMount, onDestroy } from 'svelte';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { getFileURL, getMonthName } from '$lib/util';
  import toast from 'svelte-french-toast';

  export let data;

  let waveformContainers = {};
  let wavesurfers = {};

  onMount(() => {
    data.tracks.forEach((track) => {
      console.log(track);
      const container = waveformContainers[track.id];
      if (container) {
        const width = container.offsetWidth || 1000;

        const wavesurfer = WaveSurfer.create({
          container,
          waveColor: 'darkgray',
          progressColor: '#1a82ce',
          height: 40,
          responsive: true
        });

        wavesurfer.load(getFileURL(track.collectionId, track.id, track.file));
        wavesurfers[track.id] = wavesurfer;
      }
    });
  });

  onDestroy(() => {
    for (const ws of Object.values(wavesurfers)) {
      ws.destroy();
    }
  });

  function togglePlay(id) {
    const ws = wavesurfers[id];
    if (ws) ws.playPause();
  }

  function handleKeydown(event, id) {
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlay(id);
    }
  }

  const submitMoveTrack = ({ formElement }) => {
    const dialog = formElement.closest('dialog');

    async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          toast.success('Track verplaatst.');
          break;
        case 'error':
          toast.error('Er is iets misgegaan.');
          break;
        default:
          await applyAction(result);
      }
    };

    if (dialog) dialog.close();
    return;
  };

  const submitDeleteTrack = ({ formElement }) => {
    const dialog = formElement.closest('dialog');

    async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          toast.success('Track verwijderd.');
          break;
        case 'error':
          toast.error('Er is iets misgegaan.');
          break;
        default:
          await applyAction(result);
      }
    };

    if (dialog) dialog.close();
    return;
  };
</script>

<a href="/admin/tracks" class="link link-primary">⬅️ Terug naar overzicht</a>
<h1 class="text-3xl font-bold my-3">Tracks van {getMonthName(data.month)}</h1>

{#if data.tracksGroupedByArtist.length > 0}
  {#each data.tracksGroupedByArtist as artist}
    <div class="border-base-300 bg-base-200 rounded-sm p-4 mb-4">
      <div class="flex flex-row items-center space-x-2 mb-4">
        {#if artist.artistAvatar}
          <div class="avatar">
            <div class="h-12 rounded-full">
              <img src={artist.artistAvatar} alt="User avatar" />
            </div>
          </div>
        {/if}
        <h3 class="text-2xl font-bold">{artist.artistName}</h3>
      </div>
      {#each artist.tracks as track}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          tabindex="0"
          on:keydown={(e) => handleKeydown(e, track.id)}
          class="bg-white p-2 rounded-sm space-y-4 mt-2 hover:bg-gray-100 transition-colors w-full"
        >
          <h3 class="text-lg font-semibold" title={track.title}>
            {track.title}
          </h3>

          <div bind:this={waveformContainers[track.id]} class="h-[40px] w-full"></div>

          <div class="grid grid-cols-3 gap-2">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="btn btn-secondary text-white w-full"
              on:click={() => document.getElementById(`move-${track.id}`).showModal()}
            >
              Verplaatsen
            </div>

            <dialog id={`move-${track.id}`} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">Track verplaatsen: {track.title}</h3>

                <p class="mt-2 -mb-2">
                  De artiest geeft de voorkeur aan release in de maand {track.preferredReleaseMonth}.
                </p>

                <form
                  action="?/moveTrack"
                  method="post"
                  class="space-y-4"
                  use:enhance={submitMoveTrack}
                >
                  <input type="hidden" name="trackId" value={track.id} />

                  <label for="releaseMonth" class="block mt-4 mb-1 font-medium">
                    Naar welke maand wil je deze track verplaatsen?
                  </label>
                  <input
                    type="text"
                    name="releaseMonth"
                    class="input input-bordered w-full"
                    placeholder="Maand (yyyy-mm, bijvoorbeeld: 2025-08)"
                    required
                  />

                  <button type="submit" class="btn btn-primary text-white -mt-2">Verplaatsen</button
                  >
                </form>

                <div class="modal-action">
                  <form method="dialog">
                    <button class="btn btn-error text-white">Sluiten</button>
                  </form>
                </div>
              </div>
            </dialog>

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="btn btn-error text-white w-full"
              on:click={() => document.getElementById(`delete-${track.id}`).showModal()}
            >
              Verwijderen
            </div>

            <dialog id={`delete-${track.id}`} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">Track verwijderen: {track.title}</h3>

                <p class="mt-2">Weet je zeker dat je deze track wilt verwijderen?</p>
                <p class="mb-4">
                  <b>Dit kan niet ongedaan gemaakt worden!</b>
                </p>

                <form
                  action="?/deleteTrack"
                  method="post"
                  class="space-y-4"
                  use:enhance={submitDeleteTrack}
                >
                  <input type="hidden" name="trackId" value={track.id} />

                  <button type="submit" class="btn btn-error text-white">
                    Ja, ik wil deze track verwijderen
                  </button>
                </form>

                <div class="modal-action">
                  <form method="dialog">
                    <button class="btn btn-secondary text-white">Nee, annuleren!</button>
                  </form>
                </div>
              </div>
            </dialog>

            <a
              class="btn btn-primary whitespace-nowrap w-full"
              href={`/api/download?url=${encodeURIComponent(getFileURL(track.collectionId, track.id, track.file))}&filename=${encodeURIComponent(`${track.title}.${track.file.split('.').pop()}`)}`}
            >
              Downloaden
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/each}
{:else}
  <p class="mt-2">Geen tracks in deze maand.</p>
{/if}

<style>
</style>
