export function tokenVerificationEndpoint(token, accountId) {
  return token.startsWith("cfat_") ? `/accounts/${accountId}/tokens/verify` : "/user/tokens/verify";
}

export function interpretTokenVerification(result) {
  const status = result?.result?.status || "unknown";
  return { verified: status === "active", status };
}
