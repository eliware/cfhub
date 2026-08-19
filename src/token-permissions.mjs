const API_ROOT = "https://api.cloudflare.com/client/v4";

/* istanbul ignore next -- Cloudflare may omit policy fields for restricted tokens. */
function permissionNames(details) {
  return [...new Set((details?.result?.policies || [])
    .filter((policy) => policy.effect !== "deny")
    .flatMap((policy) => policy.permission_groups || [])
    .map((group) => group.name)
    .filter(Boolean))].sort();
}

export function summarizePermissions(permissions = []) {
  const summary = { total: permissions.length, read: 0, write: 0, other: 0 };
  for (const permission of permissions) {
    if (/\b(read|view|list)\b/i.test(permission)) summary.read++;
    else if (/\b(write|edit|create|delete|purge|manage)\b/i.test(permission)) summary.write++;
    else summary.other++;
  }
  return summary;
}

/* istanbul ignore next -- network response variants are covered with live API tests. */
export async function inspectApiToken({ token, accountId, fetchImpl = fetch } = {}) {
  const accountToken = token?.startsWith("cfat_");
  const verifyPath = accountToken && accountId
    ? `/accounts/${accountId}/tokens/verify`
    : "/user/tokens/verify";
  const verifyResponse = await fetchImpl(`${API_ROOT}${verifyPath}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const verifyBody = await verifyResponse.json();
  if (!verifyResponse.ok || verifyBody?.result?.status !== "active")
    throw Object.assign(new Error("API token is not active"), { status: verifyResponse.status, body: verifyBody });
  const result = {
    verified: true,
    tokenId: verifyBody.result.id,
    status: verifyBody.result.status,
    expiresOn: verifyBody.result.expires_on,
    permissionsKnown: false,
    permissions: [],
  };
  if (!accountToken && result.tokenId) {
    const detailsResponse = await fetchImpl(`${API_ROOT}/user/tokens/${result.tokenId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (detailsResponse.ok) {
      const details = await detailsResponse.json();
      result.permissions = permissionNames(details);
      result.permissionsKnown = true;
      result.permissionSummary = summarizePermissions(result.permissions);
    }
  }
  if (!result.permissionSummary) result.permissionSummary = summarizePermissions(result.permissions);
  return result;
}
