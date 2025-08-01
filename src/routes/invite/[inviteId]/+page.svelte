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
          toast.success('Account aangemaakt, welkom bij The Movement!', { duration: 5000 });
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

<div class="flex flex-col items-center">
  <h1 class="text-3xl font-bold">Welkom bij The Movement, {data.info.stageName}!</h1>

  <p class="mt-2 mb-4">
    Je bent uitgenodigd om je account aan te maken. Vul het onderstaande formulier in om te
    beginnen.
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
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Artiestennaam</span>
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
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Volledige naam</span>
      </label>
      <input class="input input-bordered w-full" name="fullName" required disabled={loading} />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Profielfoto (png/jpg)</span>
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
        <span class="label-text">E-mailadres</span>
      </label>
      <input
        type="email"
        name="email"
        class="input input-bordered w-full"
        placeholder="naam@voorbeeld.nl"
        required
      />
    </div>

    <div class="form-control w-full">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">Wachtwoord</span>
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
        <span class="label-text">Wachtwoord bevestigen</span>
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
      Account aanmaken
    </button>
  </form>
</div>
