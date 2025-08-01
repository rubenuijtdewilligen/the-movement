<script>
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import toast from 'svelte-french-toast';

  export let data;

  let loading;
  $: loading = false;

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

<a href="/admin/artists/invite" class="btn btn-primary btn-lg mb-4">Nieuwe artiest uitnodigen</a>

<h1 class="text-3xl font-bold mb-2">Artiesten met account</h1>

<p class="mb-4">
  Artiesten waarvan door een admin handmatig de naam aan een track toegevoegd is, staan hier niet
  bij, omdat zij geen account hebben. <br /> Ook wanneer een artiest later een account gekregen heeft,
  tellen tracks van voordat de artiest een account had niet mee in "Tracks geüpload".
</p>

<div class="overflow-x-auto">
  <table class="table">
    <thead class="text-l">
      <tr>
        <th>Artiestennaam</th>
        <th>Naam</th>
        <th>Tracks geüpload</th>
        <th>Acties</th>
      </tr>
    </thead>

    <tbody>
      {#each data.artists as artist}
        <tr>
          <td>
            <a class="link link-primary" href="/admin/artists/{artist.id}">{artist.stageName}</a>
          </td>
          <td>{artist.fullName}</td>
          <td>{artist.amountOfTracks}</td>
          <td class="flex flex-row">
            <a class="btn btn-primary btn-sm" href="/admin/artists/{artist.id}"> Openen </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<h1 class="text-xl font-bold mt-4 mb-2">Uitgenodigde artiesten</h1>

{#if data.invites.length > 0}
  <p>
    Artiesten die uitgenodigd zijn om deel te nemen aan het platform, maar nog geen account hebben
    aangemaakt.
    <br />Je kan hun activatielink hier kopiëren om te delen (rechtermuisklik > linkadres kopiëren).
  </p>

  <div class="overflow-x-auto mb-10">
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
            <td><a href="/invite/{artist.id}" class="link link-primary">/invite/{artist.id}</a></td>
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
{:else}
  <p>
    Er zijn momenteel geen artiesten die wel uitgenodigd zijn om deel te nemen aan het platform,
    maar nog geen account gemaakt hebben.
  </p>
{/if}
