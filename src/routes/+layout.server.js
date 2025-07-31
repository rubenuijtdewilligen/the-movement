export let load = async ({ locals }) => {
  return {
    user: locals.user || null
  };
};
