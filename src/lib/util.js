import { env as publicEnv } from '$env/dynamic/public';

export const getFileURL = (collectionId, recordId, fileName) => {
  return `${publicEnv.PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}`;
};

export const isCurrentMonth = (month) => {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' });
  const current = new Date(now);

  const currentMonth = current.getMonth() + 1;
  const currentYear = current.getFullYear();

  const formatted = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  return formatted === month;
};

export const getMonthName = (month) => {
  const date = new Date(`${month}-01`);

  // Format the date to Dutch month name and year
  const formatter = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    month: 'long',
    year: 'numeric'
  });

  return formatter.format(date);
};

export const groupByArtistName = (tracks) => {
  const grouped = Object.values(
    tracks.reduce((acc, track) => {
      const key = track.artistName;
      if (!acc[key]) {
        acc[key] = {
          artistName: track.artistName,
          artistAvatar: track.expand?.artist?.avatar
            ? getFileURL(track.expand.artist.collectionId, track.artist, track.expand.artist.avatar)
            : null,
          tracks: []
        };
      }
      // eslint-disable-next-line no-unused-vars
      const { expand, ...cleanTrack } = track;
      acc[key].tracks.push(cleanTrack);
      return acc;
    }, {})
  );

  return grouped;
};
