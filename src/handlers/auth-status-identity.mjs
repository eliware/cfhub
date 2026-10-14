export function selectAuthStatusIdentity({ token, activeProfile, resource, data, opts }) {
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: activeProfile || data.active || "environment",
    resource,
    opts,
    data,
  };
}

export function resolveAuthStatusIdentity({ token, activeProfile, resource, data, opts, fail }) {
  if (!token) {
    fail("You are not logged into Cloudflare. Run: cfhub auth login");
    return null;
  }
  return selectAuthStatusIdentity({ token, activeProfile, resource, data, opts });
}
