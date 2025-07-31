import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (!locals.pb.authStore.isValid) {
    throw error(401, 'Unauthorized');
  }

  return {
    artists: await locals.pb.collection('users').getFullList({
      sort: 'stageName'
    })
  };
};

export const actions = {
  createTrack: async ({ request, locals }) => {
    const formData = await Object.fromEntries(await request.formData());

    if (formData.artistWithoutAccount?.length > 0) {
      try {
        console.log(formData.artistWithoutAccount, 'is the artist');

        await locals.pb.collection('tracks').create({
          title: formData.title,
          artist: null,
          artistName: formData.artistWithoutAccount,
          file: formData.file,
          preferredReleaseMonth: formData.preferredReleaseMonth
        });

        return { success: true };
      } catch (err) {
        console.error('Fout bij uploaden:', err);
        throw error(500, 'Fout bij uploaden, is je bestand kleiner dan 50MB?');
      }
    } else {
      try {
        const artistRecord = await locals.pb.collection('users').getOne(formData.artist);
        console.log(artistRecord.stageName, 'is the artist');

        await locals.pb.collection('tracks').create({
          title: formData.title,
          artist: formData.artist,
          artistName: artistRecord.stageName,
          file: formData.file,
          preferredReleaseMonth: formData.preferredReleaseMonth
        });

        return { success: true };
      } catch (err) {
        console.error('Fout bij uploaden:', err);
        throw error(500, 'Fout bij uploaden, is je bestand kleiner dan 50MB?');
      }
    }
  }
};
