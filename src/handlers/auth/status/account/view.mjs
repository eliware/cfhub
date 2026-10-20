export function createAccountTokenStatus({ statusProfile, accountId, accounts }) {
  return {
    authenticated: true,
    profile: statusProfile,
    method: "account-api-token",
    accountId: accountId || null,
    accounts: accountId ? undefined : accounts?.result || [],
  };
}
