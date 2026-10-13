export function managesCredentials(resource, action) {
  return (
    (resource === "auth" && ["login", "logout", "list", "switch"].includes(action)) ||
    (resource === "oauth" && (action === "login" || action === "logout"))
  );
}

export function missingScopeMessage(missing) {
  return `Your Cloudflare login is missing scope${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}\n\nRun cfhub auth login again and select the required permissions, or use:\n  cfhub auth login --scopes ${missing.join(",")}`;
}

export function missingApiPermissionMessage(missing) {
  return `Your active API token is missing permission${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}\n\nRun cfhub auth login again with a token that grants the required permissions.`;
}
