import { requiredScopes } from "./scopes.mjs";

const aliases = new Map([
  ["zone", "Zone"],
  ["dns", "DNS"],
  ["zone-settings", "Zone Settings"],
  ["account-rulesets", "Account Rulesets"],
  ["account-rule-lists", "Account Rule Lists"],
  ["ssl-and-certificates", "SSL and Certificates"],
  ["zone-waf", "Zone WAF"],
  ["load-balancing-monitors-and-pools", "Load Balancing Monitors and Pools"],
  ["account-settings", "Account Settings"],
  ["argotunnel", "Argo Tunnel"],
  ["workers-scripts", "Workers Scripts"],
  ["workers-r2", "Workers R2"],
  ["healthcheck", "Healthcheck"],
  ["ai", "AI"],
]);

const writeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function apiRequestScope(path, method, dryRun) {
  if (typeof path !== "string") return null;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
  const segments = decodedPath.split("/").filter(Boolean);
  const requestMethod = String(method).toUpperCase();
  if (!segments.length || !["GET", ...writeMethods].includes(requestMethod)) return null;
  const mode = dryRun || requestMethod === "GET" ? "read" : "write";
  const [root, , section, subSection] = segments;
  if (root === "zones") {
    if (segments.length === 1 || segments.length === 2) return `zone.${mode}`;
    if (section === "dns_records") return `dns.${mode}`;
    if (section === "settings") return `zone-settings.${mode}`;
    if (["ssl", "certificates"].includes(section)) return `ssl-and-certificates.${mode}`;
    if (["rulesets", "firewall", "filters"].includes(section)) return `zone-waf.${mode}`;
    if (["load_balancers", "pools", "monitors"].includes(section))
      return `load-balancing-monitors-and-pools.${mode}`;
    if (section === "healthchecks") return `healthcheck.${mode}`;
    if (section === "purge_cache") return requestMethod === "GET" ? `cache.${mode}` : "cache.purge";
    return null;
  }
  if (root !== "accounts") return null;
  if (segments.length <= 2) return `account-settings.${mode}`;
  if (section === "rules" && subSection === "lists") return `account-rule-lists.${mode}`;
  if (section === "rulesets") return `account-rulesets.${mode}`;
  if (section === "cfd_tunnel") return `argotunnel.${mode}`;
  const scopes = {
    workers: "workers-scripts",
    pages: "page",
    r2: "workers-r2",
    d1: "d1",
    queues: "queues",
    stream: "stream",
    images: "images",
    ai: "ai",
    access: "access",
    audit_logs: "account-settings",
  };
  const scope = scopes[section];
  return scope ? `${scope}.${mode}` : null;
}

function permissionName(scope) {
  const [name, mode] = scope.split(".");
  const label =
    aliases.get(name) ||
    name.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (mode === "purge") return `${label} Purge`;
  return `${label} ${mode === "write" ? "Write" : "Read"}`;
}

export function requiredApiPermissions(resource, action, options) {
  if (resource === "api") {
    const scope = apiRequestScope(action, options?.method || "GET", options?.dryRun);
    return scope ? [permissionName(scope)] : [];
  }
  return requiredScopes(resource, action, options).map(permissionName);
}

export function missingApiPermissions(resource, action, granted, options) {
  if (!granted) return [];
  const required = requiredApiPermissions(resource, action, options);
  if (resource === "api" && !required.length)
    return ["Cannot verify this API path and method against known permissions"];
  const available = new Set(granted.map((permission) => permission.toLowerCase()));
  return required.filter((permission) => !available.has(permission.toLowerCase()));
}
