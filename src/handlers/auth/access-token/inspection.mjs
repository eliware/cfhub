export async function inspectLoginToken({ token, accountId, inspectApiTokenImpl, fail }) {
  try {
    return await inspectApiTokenImpl({ token, accountId });
  } catch (error) {
    fail(`Could not verify API token: ${error.message}`);
    return null;
  }
}
