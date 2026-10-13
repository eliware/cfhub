export function selectAuthStatusIdentity({ token, resource, data, opts }) {
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: process.env.CLOUDFLARE_PROFILE || data.active || "environment",
    resource,
    opts,
    data,
  };
}

export function resolveAuthStatusIdentity({ token, resource, data, opts, fail }) {
  if (!token) {
    fail("You are not logged into Cloudflare. Run: cfhub auth login");
    return null;
  }
  return selectAuthStatusIdentity({ token, resource, data, opts });
}
