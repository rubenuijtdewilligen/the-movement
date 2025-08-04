<script>
  import { onMount } from 'svelte';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import toast from 'svelte-french-toast';
  import { getFileURL } from '$lib/util.js';

  export let data;

  let loading;
  $: loading = false;

  const showPreview = (event) => {
    const target = event.target;
    const files = target.files;

    if (files.length > 0) {
      const src = URL.createObjectURL(files[0]);
      const preview = document.getElementById('avatar-preview');
      preview.src = src;
    }
  };

  const submitUpdateSettings = ({ formElement }) => {
    loading = true;
    return async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          toast.success('Settings saved.', { duration: 5000 });
          break;
        case 'error':
          toast.error('Something went wrong.', { duration: 5000 });
          break;
        default:
          await applyAction(result);
      }
      loading = false;
    };
  };
</script>

<div class="max-w-2xl space-y-6">
  <h1 class="text-3xl font-bold">Profile settings</h1>

  <form
    method="POST"
    enctype="multipart/form-data"
    action="?/updateSettings"
    class="space-y-4"
    use:enhance={submitUpdateSettings}
  >
    <input type="hidden" name="id" value={data.user.id} />

    <label for="fullName" class="input input-bordered w-full">
      <span class="label">Name</span>
      <input name="fullName" value={data.user.fullName || ''} required disabled={loading} />
    </label>

    <label for="stageName" class="input input-bordered w-full">
      <span class="label">Stage name</span>
      <input name="stageName" value={data.user.stageName || ''} required disabled={loading} />
    </label>

    <label for="instagram" class="input input-bordered w-full">
      <span class="label">Instagram URL</span>
      <input
        name="instagram"
        type="url"
        value={data.user.instagram || ''}
        required
        disabled={loading}
      />
    </label>

    <div class="form-control w-full max-w-lg flex flex-col">
      <span class="text-black font-semibold mb-3">Profile photo (click to edit)</span>
      <label for="avatar" class="avatar hover:cursor-pointer">
        <div class="w-64 rounded-full">
          <img
            src={data.user?.avatar
              ? getFileURL(data.user?.collectionId, data.user?.id, data.user?.avatar)
              : `https://ui-avatars.com/api/?name=${data.user?.stageName}`}
            alt="User avatar"
            id="avatar-preview"
          />
        </div>
      </label>
      <input
        type="file"
        name="avatar"
        id="avatar"
        accept="image/*"
        hidden
        on:change={showPreview}
        disabled={loading}
      />
    </div>

    <button class="btn btn-primary w-full" type="submit" disabled={loading}> Save changes </button>
  </form>
</div>
