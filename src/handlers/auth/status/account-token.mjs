export async function showAccountTokenStatus({
  statusProfile,
  opts,
  data,
  cf,
  outputJson,
  toJsonOutput,
  printer,
}) {
  const accountId =
    opts?.["account-id"] ||
    data.profiles[statusProfile]?.accountId ||
    process.env.CLOUDFLARE_ACCOUNT_ID;
  const accounts = await cf.get(accountId ? `/accounts/${accountId}` : "/accounts");
  const status = {
    authenticated: true,
    profile: statusProfile,
    method: "account-api-token",
    accountId: accountId || null,
    accounts: accountId ? undefined : accounts?.result || [],
  };
  return outputJson
    ? toJsonOutput(
        Object.fromEntries(Object.entries(status).filter(([, value]) => value !== undefined)),
      )
    : printer.log(`${status.profile} authenticated with account API token`);
}
