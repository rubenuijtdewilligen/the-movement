import { groupByArtistName } from '$lib/util';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

let query = '';

export const load = async ({ url, locals }) => {
  query = url.searchParams.get('query')?.trim() ?? '';

  if (!query) {
    return { tracks: [], tracksGroupedByArtist: [], query };
  }

  try {
    const escaped = query.replace(/"/g, '\\"');

    const tracks = await locals.pb.collection('tracks').getFullList({
      filter: `title~"${escaped}" || artist.stageName~"${escaped}" || artistName~"${escaped}"`,
      expand: 'artist'
    });

    return {
      tracks,
      tracksGroupedByArtist: groupByArtistName(tracks),
      query
    };
  } catch (err) {
    console.error('Fout bij zoeken:', err);
    throw error(500, 'Zoeken is mislukt.');
  }
};

export const actions = {
  moveTrack: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').update(formData.trackId, {
        releaseMonth: formData.releaseMonth
      });
    } catch (err) {
      console.log('Error in /admin/tracks/search:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, `/admin/tracks/search?query=${query}`);
  },

  deleteTrack: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('tracks').delete(formData.trackId);
    } catch (err) {
      console.log('Error in /admin/tracks/search:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, `/admin/tracks/search?query=${query}`);
  }
};
