import { error } from '@sveltejs/kit';

export const actions = {
  updateSettings: async ({ request, locals }) => {
    const body = await request.formData();
    const userAvatar = body.get('avatar');

    if (userAvatar.size === 0) {
      body.delete('avatar');
    }

    const formData = await Object.fromEntries(body);

    try {
      await locals.pb.collection('users').update(formData.id, formData);
    } catch (err) {
      console.error('Error in /settings:', err);
      throw error(500, 'Er is iets misgegaan.');
    }
  }
};
