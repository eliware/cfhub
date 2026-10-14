export async function requestTokenVerification({ token, accountId, cf }) {
  const endpoint = token.startsWith("cfat_")
    ? `/accounts/${accountId}/tokens/verify`
    : "/user/tokens/verify";
  const result = await cf.get(endpoint);
  const status = result?.result?.status || "unknown";
  return { verified: status === "active", status };
}
