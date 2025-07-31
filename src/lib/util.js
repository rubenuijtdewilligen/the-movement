import { env as publicEnv } from '$env/dynamic/public';

export const getFileURL = (collectionId, recordId, fileName) => {
  return `${publicEnv.PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}`;
};
