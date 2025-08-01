import { error } from '@sveltejs/kit';
import { isCurrentMonth, groupByArtistName } from '$lib/util';

export const load = async ({ params, locals }) => {
  const { month } = params;

  if (!isCurrentMonth(month)) {
    return error(404, 'Not found');
  }

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
