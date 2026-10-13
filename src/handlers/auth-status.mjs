export async function handleAuthStatus({
  action,
  resource,
  opts,
  cf,
  data,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (action === "status") {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      fail("You are not logged into Cloudflare. Run: cfhub auth login");
      return;
    }
    const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (token?.startsWith("cfat_")) {
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
  if (action === "verify") {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      fail("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
      return;
    }
    const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const accountId =
      opts?.["account-id"] ||
      data.profiles[statusProfile]?.accountId ||
      process.env.CLOUDFLARE_ACCOUNT_ID;
    if (token?.startsWith("cfat_") && !accountId) {
      fail("Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID");
      return;
    }
    const result = await cf.get(
      token?.startsWith("cfat_") ? `/accounts/${accountId}/tokens/verify` : "/user/tokens/verify",
    );
    const verified = {
      verified: result?.result?.status === "active",
      status: result?.result?.status || "unknown",
    };
    return outputJson ? toJsonOutput(verified) : printer.log(`${verified.status}`);
  }
}
