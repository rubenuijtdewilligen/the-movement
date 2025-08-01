<script>
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

  const submitCreateInvite = ({ formElement }) => {
    loading = true;
    return async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          toast.success('Activatielink aan de tabel toegevoegd.', { duration: 5000 });
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

  const submitDeleteInvite = ({ formElement }) => {
    loading = true;
    return async ({ result }) => {
      switch (result.type) {
        case 'success':
          await invalidateAll();
          formElement.reset();
          toast.success('Uitnodiging ingetrokken.', { duration: 5000 });
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
  <a href="/admin/artists" class="link link-primary">⬅️ Terug naar alle artiesten</a>
  <h1 class="text-3xl font-bold">Nieuwe artiest uitnodigen</h1>

  <form
    method="POST"
    enctype="multipart/form-data"
    action="?/createInvite"
    class="space-y-4"
    use:enhance={submitCreateInvite}
  >
    <input
      class="input input-bordered w-full"
      name="stageName"
      placeholder="Artiestennaam"
      required
      disabled={loading}
    />

    <button class="btn btn-primary w-full" type="submit" disabled={loading}>
      Activatielink maken
    </button>
  </form>
</div>

{#if data.invites.length > 0}
  <h1 class="text-xl font-bold mt-4 mb-2">Uitgenodigde artiesten</h1>

  <p>
    Artiesten die uitgenodigd zijn om deel te nemen aan het platform, maar nog geen account hebben
    aangemaakt.
    <br />Je kan hun activatielink hier kopiëren om te delen (rechtermuisklik > linkadres kopiëren).
  </p>

  <div class="overflow-x-auto">
    <table class="table">
      <thead class="text-l">
        <tr>
          <th>Artiestennaam</th>
          <th>Activatielink</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {#each data.invites as artist}
          <tr>
            <td>{artist.stageName}</td>
            <td>
              <a href="/invite/{artist.id}" class="link link-primary" target="_blank">
                /invite/{artist.id}
              </a>
            </td>
            <td>
              <form action="?/deleteInvite" method="POST" use:enhance={submitDeleteInvite}>
                <input type="hidden" name="id" value={artist.id} />
                <button type="submit" class="btn btn-error text-white btn-sm">
                  Uitnodiging intrekken
                </button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
