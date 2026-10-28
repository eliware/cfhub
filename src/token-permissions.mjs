const API_ROOT = "https://api.cloudflare.com/client/v4";
import { permissionNames, summarizePermissions } from "./permission-summary.mjs";
export { summarizePermissions } from "./permission-summary.mjs";

export async function inspectApiToken({ token, accountId, fetchImpl = fetch } = {}) {
  const accountToken = token?.startsWith("cfat_");
  if (accountToken && accountId && !/^[A-Za-z0-9_-]+$/.test(accountId))
    throw new Error("Account ID contains invalid path characters");
  const verifyPath =
    accountToken && accountId ? `/accounts/${accountId}/tokens/verify` : "/user/tokens/verify";
  const verifyResponse = await fetchImpl(`${API_ROOT}${verifyPath}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const verifyBody = await verifyResponse.json();
  if (!verifyResponse.ok || verifyBody?.result?.status !== "active")
    throw Object.assign(new Error("API token is not active"), {
      status: verifyResponse.status,
      body: verifyBody,
    });
  const result = {
    verified: true,
    tokenId: verifyBody.result.id,
    status: verifyBody.result.status,
    expiresOn: verifyBody.result.expires_on,
    permissionsKnown: false,
    permissions: [],
  };
  if (!accountToken && result.tokenId) {
    try {
      const detailsResponse = await fetchImpl(`${API_ROOT}/user/tokens/${result.tokenId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        result.permissions = permissionNames(details);
        result.permissionsKnown = true;
        result.permissionSummary = summarizePermissions(result.permissions);
      }
    } catch {
      // Permission details are optional after token verification.
    }
  }
  if (!result.permissionSummary)
    result.permissionSummary = summarizePermissions(result.permissions);
  return result;
}
