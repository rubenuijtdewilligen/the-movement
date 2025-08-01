import { groupByArtistName } from '$lib/util';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
  const { month } = params;

  const tracks = await locals.pb.collection('tracks').getFullList({
    filter: `releaseMonth="${month}"`,
    expand: 'artist'
  });

  return {
    tracks,
    tracksGroupedByArtist: groupByArtistName(tracks),
    month
  };
};

export const actions = {
  moveTrack: async ({ request, locals, params }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').update(formData.trackId, {
        releaseMonth: formData.releaseMonth
      });
    } catch (err) {
      console.log('Error in /admin/tracks/[month]:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, `/admin/tracks/${params.month}`);
  },

  deleteTrack: async ({ request, locals, params }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').delete(formData.trackId);
    } catch (err) {
      console.log('Error in /admin/tracks/[month]:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, `/admin/tracks/${params.month}`);
  }
};
