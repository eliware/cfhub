export async function inspectLoginToken({ token, accountId, inspectApiTokenImpl, fail }) {
  try {
    return await inspectApiTokenImpl({ token, accountId });
  } catch {
    fail("Could not verify API token. Check that the token is valid and try again.");
    return null;
  }
}
