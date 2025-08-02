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
          toast.success('Added activation link to the table.', { duration: 5000 });
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

<div class="max-w-2xl space-y-6">
  <a href="/admin/artists" class="link link-primary">⬅️ Back to artist overview</a>
  <h1 class="text-3xl font-bold">Invite new artist</h1>

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
      placeholder="Stage name"
      required
      disabled={loading}
    />

    <button class="btn btn-primary w-full" type="submit" disabled={loading}>
      Create activation link
    </button>
  </form>
</div>

{#if data.invites.length > 0}
  <h1 class="text-xl font-bold mt-4 mb-2">Invited artists</h1>

  <p>
    Artists who have been invited to join the platform but have not yet created an account.
    <br />You can copy their activation link here to share (right-click > copy link address).
  </p>

  <div class="overflow-x-auto">
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
            <td>
              <a href="/invite/{artist.id}" class="link link-primary" target="_blank">
                /invite/{artist.id}
              </a>
            </td>
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
{/if}
