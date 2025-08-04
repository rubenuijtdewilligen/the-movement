<script>
  import PocketBase from 'pocketbase';
  import { env } from '$env/dynamic/public';
  import { writable } from 'svelte/store';
  import { getMonthName } from '$lib/util.js';

  export let data;

  let files = null;
  let uploads = writable([]);

  let releaseMonth = '';
  let artistId = '';
  let artistName = '';

  let packId = '';

  async function uploadFiles() {
    if (!files) return;

    const maxSize = 100 * 1024 * 1024; // 100MB
    const uploadStatus = Array.from(files).map((file) => ({
      name: file.name,
      progress: 0,
      status: file.size > maxSize ? 'Too large, maximum 100 MB' : 'Uploading...'
    }));

    uploads.set(uploadStatus);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) continue;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.').slice(0, -1).join('.'));
      formData.append('preferredReleaseMonth', releaseMonth);
      formData.append('releaseMonth', releaseMonth);

      if (artistId) {
        formData.append('artist', artistId);
        formData.append('artistName', data.artists.find((u) => u.id === artistId).stageName);
      } else if (artistName) {
        formData.append('artistName', artistName);
      }

      try {
        const trackId = await uploadWithProgress(formData, i);

        if (packId) {
          await addTrackToPack(trackId, packId);
        }
      } catch (err) {
        console.log(err);
        uploads.update((list) => {
          list[i].status = 'Upload mislukt';
          return [...list];
        });
      }
    }
  }

  function uploadWithProgress(formData, index) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${env.PUBLIC_POCKETBASE_URL}/api/collections/tracks/records`);
      xhr.setRequestHeader('Authorization', `Bearer ${data.authToken}`);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          uploads.update((list) => {
            list[index].progress = percent;
            return [...list];
          });
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          uploads.update((list) => {
            list[index].status = 'Done';
            list[index].progress = 100;
            return [...list];
          });
          resolve(JSON.parse(xhr.responseText).id);
        } else {
          reject(xhr.responseText);
        }
      };

      xhr.onerror = () => reject('Netwerkfout');
      xhr.send(formData);
    });
  }
</script>

{#if $uploads.length < 1}
  <div class="max-w-2xl space-y-3">
    <h1 class="text-3xl font-bold">Mass Upload</h1>

    <p>
      Using this tool, you can upload multiple tracks from an artist at once. Specify in advance who
      the artist is and in which month the track should be released. The tracks will be
      automatically accepted.
    </p>

    <div class="mb-4 p-4 bg-base-200 rounded">
      <label for="artist-select" class="block mb-1 font-medium">Select artist:</label>
      <select
        id="artist-select"
        name="artistId"
        class="select select-bordered w-full"
        bind:value={artistId}
      >
        <option value=""></option>
        {#each data.artists as artist}
          <option value={artist.id}>{artist.stageName}</option>
        {/each}
      </select>

      <label for="artistName" class="block mt-4 mb-1 font-medium">
        or enter the name of an artist without an account:
      </label>
      <input
        type="text"
        name="artistName"
        bind:value={artistName}
        class="input input-bordered w-full"
        placeholder="Naam van artiest zonder account"
      />
    </div>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Release month (yyyy-mm, e.g.: 2025-08)</legend><input
        class="input input-bordered w-full"
        name="releaseMonth"
        bind:value={releaseMonth}
        placeholder="Release month (yyyy-mm, e.g.: 2025-08)"
        required
      />
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Choose your files</legend>
      <input
        class="file-input w-full"
        type="file"
        accept="audio/*"
        multiple
        required
        on:change={(e) => (files = e.target.files)}
      />
    </fieldset>

    <button on:click={uploadFiles} class="btn btn-primary w-full">Upload</button>
  </div>
{/if}

{#if $uploads.length > 0}
  <h1 class="text-3xl font-bold">Mass Upload</h1>

  <p class="my-4">
    You are uploading {files.length} tracks for {artistId
      ? data.artists.find((u) => u.id === artistId).stageName
      : artistName || 'unknown artist'}. The tracks will be released in {getMonthName(
      releaseMonth
    )}.
  </p>

  <div class="overflow-x-auto mb-2">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th></th>
          <th>File Name</th>
          <th>Progress</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each $uploads as upload, index}
          <tr>
            <th>{index + 1}</th>
            <td>{upload.name}</td>
            <td>
              {upload.progress}%&nbsp;
              <progress class="progress w-52 progress-primary" value={upload.progress} max="100"
              ></progress>
            </td>
            <td>{upload.status}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if $uploads.every((upload) => upload.status === 'Done' || upload.status === 'Too large, maximum 100 MB')}
    <button
      class="btn btn-primary btn-lg mt-2 mb-8"
      on:click={() => {
        window.scrollTo(0, 0);
        location.reload();
      }}
    >
      New mass upload
    </button>
  {/if}
{/if}
