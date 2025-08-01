import { error, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  return {
    info: await locals.pb.collection('invites').getOne(params.inviteId)
  };
};

export const actions = {
  registerAccount: async ({ locals, request }) => {
    const body = await request.formData();
    const userAvatar = body.get('avatar');

    if (userAvatar.size === 0) {
      body.delete('avatar');
    }

    const formData = await Object.fromEntries(body);

    try {
      await locals.pb.collection('users').create({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        fullName: formData.fullName,
        stageName: formData.stageName,
        avatar: formData.avatar,
        role: 'artist',
        invite: formData.inviteId
      });

      await locals.pb.collection('users').authWithPassword(formData.email, formData.password);
      await locals.pb.collection('invites').update(formData.inviteId, { used: true });
    } catch (err) {
      console.log('Error in /invite/[inviteId]:', err);
      throw error(500, 'Er is iets mis gegaan.');
    }

    throw redirect(303, '/');
  }
};
