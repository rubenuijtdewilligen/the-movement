import { error, redirect } from '@sveltejs/kit';

export const load = ({ locals }) => {
  if (locals.pb.authStore.isValid) {
    throw redirect(303, '/upload');
  }
};

export const actions = {
  login: async ({ locals, request }) => {
    const body = Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('users').authWithPassword(body.email, body.password);
    } catch (err) {
      console.log('Error in /login:', err);
      throw error(500, 'Er is iets misgegaan.');
    }

    throw redirect(303, '/upload');
  }
};
