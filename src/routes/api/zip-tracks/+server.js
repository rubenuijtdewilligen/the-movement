import archiver from 'archiver';
import { Readable } from 'stream';

export const POST = async ({ request }) => {
  const { tracks } = await request.json();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('data', (chunk) => writer.write(chunk));
  archive.on('error', (err) => {
    console.error('Archiver error:', err);
    writer.abort(err);
  });
  archive.on('end', () => writer.close());

  for (const track of tracks) {
    try {
      const res = await fetch(track.url);
      if (!res.ok || !res.body) {
        console.warn(`Skipping ${track.title}: could not fetch`);
        continue;
      }

      const nodeStream = Readable.fromWeb(res.body);
      archive.append(nodeStream, { name: track.title + '.' + track.url.split('.').pop() });
    } catch (e) {
      console.warn(`Skipping ${track.title} due to error:`, e);
    }
  }

  archive.finalize();

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=themovement-tracks.zip'
    }
  });
};
