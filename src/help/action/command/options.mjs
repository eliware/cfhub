import { localResources, resourceScopes, writeActions } from "./catalog.mjs";

export function requiredOptions(resource, action) {
  const result = [];
  const owner = resourceScopes[resource];
  if (owner === "zone" && !(resource === "zones" && ["list", "create"].includes(action)))
    result.push("--zone-id <zone_id>");
  if (owner === "account") result.push("--account-id <account_id>");
  if (owner === "either") result.push("(--zone-id <zone_id> | --account-id <account_id>)");
  if (resource === "zones" && action === "list") result.push("[--account-id <account_id>]");
  if (resource === "zone-settings") result.push("--setting <name>");
  if (resource === "ssl" && ["get", "set"].includes(action)) result.push("[--setting <name>]");
  if (resource === "list-items") result.push("--id <list_id>");
  if (["get", "update", "delete"].includes(action) && !localResources.has(resource)) {
    if (!new Set(["zones", "api"]).has(resource)) result.push("--id <id>");
  }
  if (["create", "update", "set", "diff", "apply"].includes(action))
    result.push("--data <json> | --file <path>");
  if (resource === "list-items" && action === "delete") result.push('--data {"ids":[<id>]}');
  if (resource === "cache" && action === "purge")
    result.push("--data <selector_json> | --file <path>");
  if (resource === "api") result.push("[--method <method>] [--data <json> | --file <path>]");
  if (resource === "zones" && action === "create") result.push("--data <json> | --file <path>");
  return [...new Set(result)].join(" ");
}

export function optionLines(resource, action) {
  const lines = [
    "  --help                 Show this help.",
    "  --json                 Print JSON output.",
  ];
  lines.push("  --output <format>      Select json or text output (default: text).");
  const owner = resourceScopes[resource];
  if (resource === "zones" && action === "list")
    lines.push("  --account-id <id>      Filter by account (default: CLOUDFLARE_ACCOUNT_ID).");
  else if (owner === "zone" && !(resource === "zones" && action === "create"))
    lines.push("  --zone-id <id>         Use CLOUDFLARE_ZONE_ID when omitted.");
  if (owner === "account")
    lines.push("  --account-id <id>      Use CLOUDFLARE_ACCOUNT_ID when omitted.");
  if (owner === "either") lines.push("  --zone-id / --account-id  Select a zone or account scope.");
  if (resource === "list-items") lines.push("  --id <list_id>         Select the list.");
  else if (
    ["get", "update", "delete"].includes(action) &&
    !localResources.has(resource) &&
    !["zones", "api"].includes(resource)
  )
    lines.push("  --id <id>              Select the resource.");
  if (["create", "update", "set", "diff", "apply"].includes(action))
    lines.push("  --data / --file        Supply a JSON request body.");
  if (writeActions.has(action) && !localResources.has(resource))
    lines.push("  --dry-run              Preview the write without sending it (default: off).");
  if (
    ["delete", "apply", "purge", "revoke"].includes(action) ||
    (resource === "extension" && action === "remove")
  )
    lines.push("  --force                Confirm this destructive operation.");
  if (resource === "list-items" && action === "list")
    lines.push(
      "  --paginate             Fetch every cursor page.",
      "  --per-page <count>     Set 1 to 500 items per page (default with --paginate: 100).",
    );
  if (resource === "api")
    lines.push(
      "  --method <method>      GET, POST, PUT, PATCH, or DELETE (default: GET).",
      "  --dry-run              Preview a write without sending it (default: off).",
      "  DELETE requires --force unless --dry-run is enabled.",
    );
  if (resource === "ssl" && ["get", "set"].includes(action))
    lines.push("  --setting <name>       Select a setting (default: ssl).");
  if (resource === "zone-settings")
    lines.push("  --setting <name>       Required zone setting name.");
  if (resource === "extension" && ["info", "remove"].includes(action))
    lines.push("  --name <name>          Select the installed extension.");
  if (resource === "extension" && ["install", "upgrade"].includes(action))
    lines.push("  --path <directory>     Select the extension source directory.");
  if (["auth", "oauth"].includes(resource))
    lines.push(
      "  --profile <name>       Select a profile (default: default).",
      "  --account-id / --zone-id  Associate a scope with the profile.",
    );
  if (resource === "oauth" && action === "login")
    lines.push(
      "  --scopes / --scope     Request additional scopes.",
      "  --no-scope-picker      Skip the browser scope picker.",
    );
  if (resource === "auth" && action === "login")
    lines.push("  --token-stdin          Read the API token from standard input.");
  return lines;
}
