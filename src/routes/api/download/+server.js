export const GET = async ({ url, fetch, locals }) => {
  const fileUrl = url.searchParams.get('url');
  const filename = url.searchParams.get('filename') ?? 'download.mp3';
  const trackId = url.searchParams.get('id');

  if (!fileUrl) return new Response('Missing url', { status: 400 });

  await locals.pb.collection('download_logs').create({ track: trackId, singleDownload: true });

  const response = await fetch(fileUrl);
  if (!response.ok) return new Response('Failed to fetch file', { status: 500 });

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';

  return new Response(response.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
};
