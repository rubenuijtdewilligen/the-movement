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
