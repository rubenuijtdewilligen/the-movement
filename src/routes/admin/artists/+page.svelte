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
          toast.success('Invitation withdrawn.', { duration: 5000 });
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

<a href="/admin/artists/invite" class="btn btn-primary btn-lg mb-4">Invite new artist</a>

<h1 class="text-3xl font-bold mb-2">Artists with an account</h1>

<p class="mb-4">
  Artists who have been manually added to a track by an admin are not listed here, because they do
  not have an account. <br /> Also, when an artist later gets an account, tracks from before the artist
  had an account do not count towards "Tracks uploaded".
</p>

<div class="overflow-x-auto">
  <table class="table">
    <thead class="text-l">
      <tr>
        <th>Stage name</th>
        <th>Name</th>
        <th>Tracks uploaded</th>
        <th>Actions</th>
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
            <a class="btn btn-primary btn-sm" href="/admin/artists/{artist.id}"> Open </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<h1 class="text-xl font-bold mt-4 mb-2">Invited artists</h1>

{#if data.invites.length > 0}
  <p>
    Artists who have been invited to join the platform but have not yet created an account.
    <br />You can copy their activation link here to share (right-click > copy link address).
  </p>

  <div class="overflow-x-auto mb-10">
    <table class="table">
      <thead class="text-l">
        <tr>
          <th>Stage name</th>
          <th>Activation link</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {#each data.invites as artist}
          <tr>
            <td>{artist.stageName}</td>
            <td
              ><a href="/invite/{artist.id}" class="link link-primary" target="_blank"
                >/invite/{artist.id}</a
              ></td
            >
            <td>
              <form action="?/deleteInvite" method="POST" use:enhance={submitDeleteInvite}>
                <input type="hidden" name="id" value={artist.id} />
                <button type="submit" class="btn btn-error text-white btn-sm">
                  Withdraw invitation
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
    There are currently no artists who have been invited to join the platform but have not yet
    created an account.
  </p>
{/if}
