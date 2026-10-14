export function selectAuthStatusIdentity({ token, activeProfile, resource, data, opts }) {
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: activeProfile || data.active || "environment",
    resource,
    opts,
    data,
  };
}
