import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
  const artist = await locals.pb.collection('users').getOne(params.userId);

  return {
    artist,
    tracks: await locals.pb
      .collection('tracks')
      .getFullList({ sort: 'created', filter: `artist='${artist.id}'` })
  };
};

export const actions = {
  deleteArtist: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('users').delete(formData.userId);
    } catch (err) {
      console.log('Error in /admin/artists/[userId]:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, '/admin/artists');
  }
};
