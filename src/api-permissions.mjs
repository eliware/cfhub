import { requiredScopes } from "./scopes.mjs";

const aliases = new Map([
  ["zone", "Zone"],
  ["dns", "DNS"],
  ["zone-settings", "Zone Settings"],
  ["account-rulesets", "Account Rulesets"],
  ["account-rule-lists", "Account Rule Lists"],
]);

export function requiredApiPermissions(resource, action, options) {
  return requiredScopes(resource, action, options).map((scope) => {
    const [name, mode] = scope.split(".");
    const label =
      aliases.get(name) ||
      name.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    return `${label} ${mode === "write" ? "Write" : "Read"}`;
  });
}

export function missingApiPermissions(resource, action, granted, options) {
  if (!granted) return [];
  const available = new Set(granted.map((permission) => permission.toLowerCase()));
  return requiredApiPermissions(resource, action, options).filter(
    (permission) => !available.has(permission.toLowerCase()),
  );
}
