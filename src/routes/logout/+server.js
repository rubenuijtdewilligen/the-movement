import { redirect } from '@sveltejs/kit';

export const POST = ({ locals }) => {
  locals.pb.authStore.clear();

  throw redirect(303, '/');
};
