import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const artistsRecords = await locals.pb.collection('users').getFullList({ sort: 'stageName' });

  const artists = await Promise.all(
    artistsRecords.map(async (artist) => {
      const tracks = await locals.pb.collection('tracks').getFullList({
        filter: `artist='${artist.id}'`
      });

      return {
        id: artist.id,
        stageName: artist.stageName,
        fullName: artist.fullName,
        amountOfTracks: tracks.length
      };
    })
  );

  const invites = await locals.pb.collection('invites').getFullList({
    sort: 'stageName',
    filter: 'used=false'
  });

  return { artists, invites };
};

export const actions = {
  deleteInvite: async ({ request, locals }) => {
    const formData = await Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('invites').delete(formData.id);

      return { success: true };
    } catch (err) {
      console.error('Error in /admin/artists/invite:', err);
      throw error(500, 'Er is iets misgegaan.');
    }
  }
};
