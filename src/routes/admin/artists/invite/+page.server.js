import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  return {
    invites: await locals.pb.collection('invites').getFullList({
      sort: 'stageName',
      filter: 'used=false'
    })
  };
};

export const actions = {
  createInvite: async ({ request, locals }) => {
    const formData = await Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('invites').create(formData);

      return { success: true };
    } catch (err) {
      console.error('Error in /admin/artists/invite:', err);
      throw error(500, 'Er is iets misgegaan.');
    }
  },

  deleteInvite: async ({ request, locals }) => {
    const formData = await Object.fromEntries(await request.formData());

    try {
      await locals.pb.collection('invites').delete(formData.id);

      return { success: true };
    } catch (err) {
      console.error('Error in /admin/artists/invite:', err);
      throw error(500, 'Er is iets misgegaan.');
    }
  }
};
