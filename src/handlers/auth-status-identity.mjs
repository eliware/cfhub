export function selectAuthStatusIdentity({ token, resource, data, opts }) {
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: process.env.CLOUDFLARE_PROFILE || data.active || "environment",
    resource,
    opts,
    data,
  };
}
