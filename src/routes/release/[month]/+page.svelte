<script>
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faInstagram } from '@fortawesome/free-brands-svg-icons';
  import { faPlay } from '@fortawesome/free-solid-svg-icons';
  import WaveSurfer from 'wavesurfer.js';
  import { onMount, onDestroy } from 'svelte';
  import { getFileURL, getMonthName } from '$lib/util';

  export let data;

  let waveformContainers = {};
  let wavesurfers = {};
  let isDownloading = false;
  let progress = 0;

  onMount(() => {
    data.tracks.forEach((track) => {
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

  async function downloadAllTracks() {
    isDownloading = true;
    progress = 0;

    const tracks = data.tracks.map((track) => ({
      url: getFileURL(track.collectionId, track.id, track.file),
      title: track.title,
      id: track.id
    }));

    const response = await fetch('/api/zip-tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks })
    });

    if (!response.ok) {
      alert('Error while creating zip.');
      isDownloading = false;
      return;
    }

    const contentLength = response.headers.get('Content-Length');
    const totalSize = contentLength ? parseInt(contentLength) : null;

    const reader = response.body?.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;

      if (totalSize) {
        progress = Math.round((received / totalSize) * 100);
      } else {
        progress = Math.min(progress + 15, 85); // fake progress if no content length
      }
    }

    const blob = new Blob(chunks, { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `themovement_tracks_${data.month}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    isDownloading = false;
    progress = 0;
  }
</script>

<div class="mb-4 flex flex-row items-center justify-between">
  <h1 class="text-3xl font-bold">The Movement {getMonthName(data.month)}</h1>
  <button
    class="btn btn-primary btn-lg"
    on:click|preventDefault={downloadAllTracks}
    disabled={isDownloading}
  >
    {#if isDownloading}
      Downloading...
    {:else}
      Download all tracks
    {/if}
  </button>
</div>

{#if isDownloading}
  <progress class="progress progress-primary mb-4 w-full" value={progress} max="100"></progress>
{/if}

{#if data.tracksGroupedByArtist.length > 0}
  <p class="my-2 hidden md:flex">Move your mouse over a title to read it if it gets cut off.</p>

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
        <h3 class="text-2xl font-bold">
          {artist.artistName}
          {#if artist.instagram}
            <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} class="text-2xl link link-primary" />
            </a>
          {/if}
        </h3>
      </div>
      {#each artist.tracks as track}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          on:keydown={(e) => handleKeydown(e, track.id)}
          tabindex="0"
          class="bg-white p-2 rounded-sm space-y-4 mt-2 hover:bg-gray-100 transition-colors w-full"
        >
          <h3 class="font-semibold text-lg text-left" title={track.title}>
            {track.title}
          </h3>

          <div class="flex flex-row items-center">
            <div class="flex items-center space-x-2">
              <button type="button" on:click={() => togglePlay(track.id)}>
                <FontAwesomeIcon icon={faPlay} class="text-2xl text-primary mr-4" />
              </button>
            </div>

            <div bind:this={waveformContainers[track.id]} class="h-[40px] w-full"></div>
          </div>

          <a
            class="btn btn-primary whitespace-nowrap w-full"
            href={`/api/download?url=${encodeURIComponent(getFileURL(track.collectionId, track.id, track.file))}&filename=${encodeURIComponent(`${track.title}.${track.file.split('.').pop()}`)}&id=${track.id}`}
          >
            Download
          </a>
        </div>
      {/each}
    </div>
  {/each}
{:else}
  <p class="mt-2">No tracks have been released this month. Keep an eye on your inbox!</p>
{/if}

<style>
</style>
