export async function showAuthStatus({
  resource,
  opts,
  cf,
  data,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    fail("You are not logged into Cloudflare. Run: cfhub auth login");
    return;
  }
  const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token.startsWith("cfat_")) {
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
  const identity = await cf.get("/user");
  const status = {
    authenticated: true,
    profile: statusProfile,
    method:
      resource === "oauth" ? "oauth" : data.profiles[statusProfile]?.authMethod || "api-token",
    id: identity?.result?.id || null,
    email: identity?.result?.email || null,
  };
  return outputJson
    ? toJsonOutput(status)
    : printer.log(`${status.profile} authenticated${status.email ? ` as ${status.email}` : ""}`);
}
