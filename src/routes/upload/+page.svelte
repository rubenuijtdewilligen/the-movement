<script>
  import { onMount } from 'svelte';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import toast from 'svelte-french-toast';

  export let data;

  let loading;
  $: loading = false;

  let uploadAsOther = false;
  let selectedArtist = data.user.id;

  const handleToggle = () => {
    if (uploadAsOther) {
      selectedArtist = '';
    } else {
      selectedArtist = data.user.id;
    }
  };

  const submitUpload = ({ formElement }) => {
    loading = true;
    return async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          toast.success('Track geüpload.', { duration: 5000 });
          break;
        case 'error':
          toast.error('Er is iets misgegaan.', { duration: 5000 });
          break;
        default:
          await applyAction(result);
      }
      loading = false;
    };
  };
</script>

<div class="max-w-2xl space-y-6">
  <h1 class="text-3xl font-bold">Upload new Track</h1>

  <form
    method="POST"
    enctype="multipart/form-data"
    action="?/createTrack"
    class="space-y-4"
    use:enhance={submitUpload}
  >
    <input
      class="input input-bordered w-full"
      name="title"
      placeholder="Title"
      required
      disabled={loading}
    />
    <input
      class="input input-bordered w-full"
      name="preferredReleaseMonth"
      placeholder="Preferred release month (yyyy-mm, e.g.: 2025-08)"
      required
      disabled={loading}
    />

    <input
      type="file"
      name="file"
      class="file-input file-input-bordered w-full"
      accept="audio/*"
      required
      on:change={(e) => (file = e.target.files[0])}
      disabled={loading}
    />

    {#if data.user?.role === 'admin'}
      <div class="mb-4 p-4 bg-base-200 rounded">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            bind:checked={uploadAsOther}
            class="toggle"
            on:change={handleToggle}
          />
          <span
            >You are logged in as admin, do you want to upload this track on behalf of someone else?</span
          >
        </label>

        {#if uploadAsOther}
          <div class="mt-4">
            <label for="artist-select" class="block mb-1 font-medium">Select artist:</label>
            <select
              id="artist-select"
              bind:value={selectedArtist}
              class="select select-bordered w-full"
              disabled={loading}
            >
              <option value=""></option>
              {#each data.artists as artist}
                <option value={artist.id}>{artist.stageName}</option>
              {/each}
            </select>

            <label for="artistWithoutAccount" class="block mt-4 mb-1 font-medium">
              or enter the name of an artist without an account:
            </label>
            <input
              type="text"
              name="artistWithoutAccount"
              class="input input-bordered w-full"
              placeholder="Name of artist without account"
              disabled={loading}
            />
          </div>
        {/if}
      </div>
    {/if}

    <input type="hidden" name="artist" value={selectedArtist} />

    <button class="btn btn-primary w-full" type="submit" disabled={loading}> Upload </button>
  </form>
</div>
