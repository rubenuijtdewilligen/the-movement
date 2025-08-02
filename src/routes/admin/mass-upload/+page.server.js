export const load = async ({ locals }) => {
  return {
    authToken: locals.pb.authStore.token,
    artists: await locals.pb.collection('users').getFullList({
      sort: 'stageName'
    })
  };
};
