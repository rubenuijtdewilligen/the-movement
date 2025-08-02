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

    const maxSize = 50 * 1024 * 1024; // 50MB
    const uploadStatus = Array.from(files).map((file) => ({
      name: file.name,
      progress: 0,
      status: file.size > maxSize ? 'Te groot, maximaal 50MB' : 'Bezig...'
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
            list[index].status = 'Klaar';
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
    <h1 class="text-3xl font-bold">Massa upload</h1>

    <p>
      Met deze tool kan je veel tracks van een artiest in 1x uploaden. Geef van te voren aan wie de
      artiest is en in welke maand de track gereleased moet worden. De tracks worden automatisch
      geaccepteerd.
    </p>

    <div class="mb-4 p-4 bg-base-200 rounded">
      <label for="artist-select" class="block mb-1 font-medium">Selecteer artiest:</label>
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
        of voer hier de naam van een artiest zonder account in:
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
      <legend class="fieldset-legend">Release maand (yyyy-mm, bijvoorbeeld: 2025-08)</legend><input
        class="input input-bordered w-full"
        name="releaseMonth"
        bind:value={releaseMonth}
        placeholder="Release maand (yyyy-mm, bijvoorbeeld: 2025-08)"
        required
      />
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Kies je bestanden</legend>
      <input
        class="file-input w-full"
        type="file"
        accept="audio/*"
        multiple
        required
        on:change={(e) => (files = e.target.files)}
      />
    </fieldset>

    <button on:click={uploadFiles} class="btn btn-primary w-full">Uploaden</button>
  </div>
{/if}

{#if $uploads.length > 0}
  <h1 class="text-3xl font-bold">Massa upload</h1>

  <p class="my-4">
    Je bent {files.length} tracks aan het uploaden voor {artistId
      ? data.artists.find((u) => u.id === artistId).stageName
      : artistName || 'onbekende artiest'}. Deze worden gereleased in {getMonthName(releaseMonth)}.
  </p>

  <div class="overflow-x-auto mb-2">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th></th>
          <th>Bestandsnaam</th>
          <th>Voortgang</th>
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

  {#if $uploads.every((upload) => upload.status === 'Klaar' || upload.status === 'Te groot, maximaal 50MB')}
    <button
      class="btn btn-primary btn-lg mt-2 mb-8"
      on:click={() => {
        window.scrollTo(0, 0);
        location.reload();
      }}
    >
      Nieuwe mass upload
    </button>
  {/if}
{/if}
