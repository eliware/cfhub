export function requireAuthStatusToken(token, fail) {
  if (token) return true;
  fail("You are not logged into Cloudflare. Run: cfhub auth login");
  return false;
}

export function selectAuthStatusIdentity({ token, activeProfile, resource, data, opts }) {
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: activeProfile || data.active || "environment",
    resource,
    opts,
    data,
  };
}
