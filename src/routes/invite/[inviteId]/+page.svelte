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
          toast.success('Account created, welcome to The Movement!', { duration: 5000 });
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

<div class="flex flex-col items-center">
  <h1 class="text-3xl font-bold">Welcome to The Movement, {data.info.stageName}!</h1>

  <p class="mt-2 mb-4">
    You have been invited to create your account. Please fill out the form below to get started.
  </p>

  <form
    method="POST"
    enctype="multipart/form-data"
    action="?/registerAccount"
    class="md:w-2xl space-y-2"
    use:enhance={submitUpdateSettings}
  >
    <input type="hidden" name="inviteId" value={data.info.id} />
    <input type="hidden" name="stageName" value={data.info.stageName} />

    <div class="form-control w-full">
      <label for="stageNameFake" class="label pb-1 font-medium">
        <span class="label-text">Stage name</span>
      </label>
      <input
        class="input input-bordered w-full"
        name="stageNameFake"
        value={data.info.stageName || ''}
        required
        disabled
      />
    </div>

    <div class="form-control w-full">
      <label for="fullName" class="label pb-1 font-medium">
        <span class="label-text">Full name</span>
      </label>
      <input class="input input-bordered w-full" name="fullName" required disabled={loading} />
    </div>

    <div class="form-control w-full">
      <label for="instagram" class="label pb-1 font-medium">
        <span class="label-text">Instagram URL</span>
      </label>
      <input
        class="input input-bordered w-full"
        name="instagram"
        type="url"
        required
        disabled={loading}
      />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Profile photo (png/jpg)</span>
      </label>
      <input
        type="file"
        class="file-input w-full"
        name="avatar"
        accept="image/*"
        required
        disabled={loading}
      />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Email address</span>
      </label>
      <input
        type="email"
        name="email"
        class="input input-bordered w-full"
        placeholder="name@example.nl"
        required
      />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Password</span>
      </label>
      <input
        class="input input-bordered w-full"
        name="password"
        type="password"
        required
        disabled={loading}
      />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Confirm password</span>
      </label>
      <input
        class="input input-bordered w-full"
        name="passwordConfirm"
        type="password"
        required
        disabled={loading}
      />
    </div>

    <button class="btn btn-primary w-full mt-2" type="submit" disabled={loading}>
      Create account
    </button>
  </form>
</div>
