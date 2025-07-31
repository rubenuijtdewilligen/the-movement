import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (locals.user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const newTracks = await locals.pb.collection('tracks').getFullList({
    filter: 'releaseMonth=""',
    sort: '-created'
  });

  return { newTracks };
};

export const actions = {
  denyTrack: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').delete(formData.trackId);
    } catch (err) {
      console.log('Error in /new-tracks?/denyTrack:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    return { success: true };
  },

  acceptTrack: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').update(formData.trackId, {
        releaseMonth: formData.releaseMonth
      });
    } catch (err) {
      console.log('Error in /new-tracks?/acceptTrack:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    return { success: true };
  }
};
