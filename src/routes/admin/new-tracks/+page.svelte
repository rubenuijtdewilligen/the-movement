<script>
  import WaveSurfer from 'wavesurfer.js';
  import { onMount, onDestroy, tick } from 'svelte';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { getFileURL } from '$lib/util';

  export let data;

  let waveformContainers = {};
  let wavesurfers = {};
  let isDownloading = false;
  let progress = 0;

  let loading;
  $: loading = false;

  onMount(async () => {
    await tick();

    data.newTracks.forEach((track) => {
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

  const submitAcceptTrack = ({ formElement }) => {
    const dialog = formElement.closest('dialog');

    loading = true;
    async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          break;
        case 'error':
          break;
        default:
          await applyAction(result);
      }

      loading = false;
    };

    if (dialog) dialog.close();
    return;
  };
</script>

{#if data.newTracks}
  <h1 class="text-3xl font-bold">
    Er zijn {data.newTracks.length} nieuwe tracks geüpload door artiesten
  </h1>

  <div class="space-y-2 mt-6">
    {#each data.newTracks as track}
      <div class="collapse collapse-arrow bg-base-200 border border-base-300">
        <input type="radio" name="tracks-accordion-{track.id}" />
        <div class="collapse-title font-semibold">{track.title}</div>
        <div class="collapse-content text-sm">
          <div class="mb-4">
            <p><span class="font-semibold">Artiest:</span> {track.artistName}</p>
            <p>
              <span class="font-semibold">Geüpload op:</span>
              {new Date(track.created)
                .toLocaleString('nl-NL', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                .replace(', ', ' om ')}
            </p>
          </div>

          <button
            type="button"
            bind:this={waveformContainers[track.id]}
            class="cursor-pointer w-full p-0 bg-transparent border-none outline-none"
            aria-label="Speel of pauzeer track"
            on:keydown={(event) => handleKeydown(event, track.id)}
            tabindex="0"
            style="display: block;"
          ></button>
          <p class="text-xs text-gray-500 mt-1">
            Klik op de waveform om te kiezen waar je luistert. Druk op spatie voor start/pauze.
          </p>

          <div class="mt-4 flex flex-row gap-2">
            <button
              class="btn btn-success text-white"
              on:click={() => document.getElementById(`accept-${track.id}`).showModal()}
            >
              Accepteren
            </button>

            <dialog id={`accept-${track.id}`} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">Track accepteren: {track.title}</h3>

                <p class="mt-2 -mb-2">
                  De artiest geeft de voorkeur aan release in de maand {track.preferredReleaseMonth}.
                </p>

                <form
                  action="?/acceptTrack"
                  method="post"
                  class="space-y-4"
                  use:enhance={submitAcceptTrack}
                >
                  <input type="hidden" name="trackId" value={track.id} />

                  <label for="releaseMonth" class="block mt-4 mb-1 font-medium">
                    Release maand
                  </label>
                  <input
                    type="text"
                    name="releaseMonth"
                    class="input input-bordered w-full"
                    placeholder="Release maand (yyyy-mm, bijvoorbeeld: 2025-08)"
                    value={track.preferredReleaseMonth}
                    required
                    disabled={loading}
                  />

                  <button type="submit" class="btn btn-success text-white -mt-2" disabled={loading}
                    >Accepteren</button
                  >
                </form>

                <div class="modal-action">
                  <form method="dialog">
                    <button class="btn btn-error text-white">Sluiten</button>
                  </form>
                </div>
              </div>
            </dialog>

            <form action="?/denyTrack" method="post">
              <input type="hidden" name="trackId" value={track.id} />
              <button type="submit" class="btn btn-error text-white">Afwijzen</button>
            </form>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p>Er zijn geen nieuwe nummers geüpload door artiesten.</p>
{/if}
