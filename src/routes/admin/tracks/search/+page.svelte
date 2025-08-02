<script>
  import { onMount, onDestroy } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { getFileURL } from '$lib/util';
  import toast from 'svelte-french-toast';

  export let data;

  let query = data.query;
  let waveformContainers = {};
  let wavesurfers = {};

  function handleSubmit(e) {
    const params = new URLSearchParams({ query });
    window.location.href = `/admin/tracks/search?${params.toString()}`;
  }

  onMount(() => {
    data.tracks.forEach((track) => {
      const container = waveformContainers[track.id];
      if (container) {
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
    Object.values(wavesurfers).forEach((ws) => ws.destroy());
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
          toast.success('Track moved.');
          break;
        case 'error':
          toast.error('Something went wrong.');
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
          toast.success('Track deleted.');
          break;
        case 'error':
          toast.error('Something went wrong.');
          break;
        default:
          await applyAction(result);
      }
    };

    if (dialog) dialog.close();
    return;
  };
</script>

<a href="/admin/tracks" class="link link-primary">⬅️ Back to overview</a>
<h1 class="text-3xl font-bold my-3">Search for tracks</h1>

<form on:submit|preventDefault={handleSubmit} class="mb-4 flex gap-2">
  <input
    type="text"
    bind:value={query}
    class="input input-bordered w-full"
    placeholder="Search by title or artist"
  />
  <button type="submit" class="btn btn-primary text-white">Search</button>
</form>

{#if data.tracks.length > 0}
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
          <div class="flex items-center space-x-2">
            {#if track.releaseMonth.length > 0}
              <div class="badge badge-primary">{track.releaseMonth}</div>
            {/if}
            <h2 class="text-lg font-semibold">{track.title}</h2>
          </div>

          <div bind:this={waveformContainers[track.id]} class="h-[40px] w-full"></div>

          <div class="grid grid-cols-3 gap-2">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="btn btn-secondary text-white w-full"
              on:click={() => document.getElementById(`move-${track.id}`).showModal()}
            >
              Move
            </div>

            <dialog id={`move-${track.id}`} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">Move track: {track.title}</h3>

                <p class="mt-2 -mb-2">
                  The artist prefers a release in the month {track.preferredReleaseMonth}.
                </p>

                <form
                  action="?/moveTrack"
                  method="post"
                  class="space-y-4"
                  use:enhance={submitMoveTrack}
                >
                  <input type="hidden" name="trackId" value={track.id} />

                  <label for="releaseMonth" class="block mt-4 mb-1 font-medium">
                    Which month do you want to move this track to?
                  </label>
                  <input
                    type="text"
                    name="releaseMonth"
                    class="input input-bordered w-full"
                    placeholder="Maand (yyyy-mm, bijvoorbeeld: 2025-08)"
                    required
                  />

                  <button type="submit" class="btn btn-primary text-white -mt-2">Move</button>
                </form>

                <div class="modal-action">
                  <form method="dialog">
                    <button class="btn btn-error text-white">Close</button>
                  </form>
                </div>
              </div>
            </dialog>

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="btn btn-error text-white w-full"
              on:click={() => document.getElementById(`delete-${track.id}`).showModal()}
            >
              Delete
            </div>

            <dialog id={`delete-${track.id}`} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">Delete track: {track.title}</h3>

                <p class="mt-2">Are you sure you want to delete this track?</p>
                <p class="mb-4">
                  <b>This cannot be undone!</b>
                </p>

                <form
                  action="?/deleteTrack"
                  method="post"
                  class="space-y-4"
                  use:enhance={submitDeleteTrack}
                >
                  <input type="hidden" name="trackId" value={track.id} />

                  <button type="submit" class="btn btn-error text-white">
                    Yes, I want to delete this track
                  </button>
                </form>

                <div class="modal-action">
                  <form method="dialog">
                    <button class="btn btn-secondary text-white">No, cancel!</button>
                  </form>
                </div>
              </div>
            </dialog>

            <a
              class="btn btn-primary whitespace-nowrap w-full"
              href={`/api/download?url=${encodeURIComponent(getFileURL(track.collectionId, track.id, track.file))}&filename=${encodeURIComponent(`${track.title}.${track.file.split('.').pop()}`)}`}
            >
              Download
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/each}
{:else if data.query}
  <p class="text-gray-600 mt-4">No results for: <b>{data.query}</b></p>
{/if}
