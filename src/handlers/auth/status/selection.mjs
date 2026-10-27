import { requireAuthStatusToken } from "./token-validation.mjs";

export function selectAuthStatusIdentity({ token, fail, activeProfile, resource, data, opts }) {
  if (!requireAuthStatusToken(token, fail)) return null;
  return {
    kind: token.startsWith("cfat_") ? "account" : "user",
    profile: activeProfile || data.active || "environment",
    resource,
    opts,
    data,
  };
}
