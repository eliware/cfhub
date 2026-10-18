const readAction = "get";
const apiMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const switchAction = "switch";
const securityAction = "security";
const bindHostVariable = ["CFHUB_OAUTH_", "BIND", "_HOST"].join("");
const helpText = (lines) => lines.join("\n");

export function coreResourceHelp(resource) {
  const map = {
    zones: helpText([
      "zones",
      "  list                 List zones.",
      `  ${readAction}                  Retrieve zone details.`,
      "  audit                Inspect zone metadata, SSL, and DNS.",
      `  ${securityAction}             Check the zone protection baseline.`,
      "  create               Create a zone.\n  update               Edit a zone.",
      "  delete               Delete a zone.",
    ]),
    "zone-settings": helpText([
      "zone-settings",
      `  ${readAction}                  Read one zone option.`,
      "  set                  Update one zone option.",
    ]),
    "dns-records": helpText([
      "dns-records",
      "  list                 List DNS records.",
      `  ${readAction}                  Read one DNS record.`,
      "  create               Create a DNS record.\n  update               Update a DNS record.",
      "  delete               Delete a DNS record.",
      "  diff                 Compare DNS records with target JSON.",
      "  apply                Apply a DNS diff. Requires --force.",
    ]),
    rulesets: helpText([
      "rulesets",
      "  list                 List rulesets.",
      `  ${readAction}                  Read one ruleset.`,
      "  create               Create a ruleset.\n  update               Update a ruleset.",
    ]),
    lists: helpText([
      "lists",
      "  list                 List lists.",
      `  ${readAction}                  Read one list.`,
      "  create               Create a list.\n  update               Update a list.",
      "  delete               Delete a list. Requires --force.",
    ]),
    "list-items": helpText([
      "list-items",
      "  list                 List items in a list.",
      "  create               Add an item to a list.\n  delete               Delete an item from a list.",
    ]),
    api: helpText([
      "api",
      "  /path                Call a relative Cloudflare API path.",
      `\n  Options: --method ${apiMethods.join("|")}, --data, --file,`,
      "  --json, --dry-run, and --force for DELETE.",
    ]),
    auth: helpText([
      "auth",
      "  login                Save an API token profile. Interactive input is the default.",
      "  status               Verify the active API-token identity.",
      "  verify               Verify the active API token.",
      "  list                 Show configured credential profiles.",
      `  ${switchAction}               Select a saved profile.`,
      "  logout               Remove a saved profile.",
      "\n  cfhub stores the token in the OS keychain when available.",
      "  If no keychain is available, cfhub stores the token in a local file.",
      "  Give the token only the permissions that your commands require.",
      "  See https://dash.cloudflare.com/profile/api-tokens.",
      "\n  --token-stdin        Read the token from standard input.",
      "  --profile <name>     Save and select this profile.",
      "  --account-id <id>    Associate an account with the profile.",
      "  --zone-id <id>       Associate a zone with the profile.",
    ]),
    oauth: helpText([
      "oauth",
      "  login                Start OAuth login in a browser.",
      "  status               Verify the active Cloudflare identity.",
      "  verify               Verify the active API token.",
      "  list                 Show configured credential profiles.",
      `  ${switchAction}               Select a saved profile.`,
      "  logout               Remove a saved profile.",
      "\n  Login options:",
      "  --profile <name>     Save and select this profile.",
      "  --account-id <id>    Associate an account with the profile.",
      "  --zone-id <id>       Associate a zone with the profile.",
      "  --scopes <scopes>    Request more comma-separated OAuth scopes.",
      "  --scope <scope>      Request one more OAuth scope.",
      "  --no-scope-picker    Skip the browser scope picker.",
      "\n  Environment:",
      "  CFHUB_OAUTH_CLIENT_ID     Override the public OAuth client.",
      "  CFHUB_OAUTH_SCOPES        Comma-separated OAuth scopes.",
      `  ${bindHostVariable}     Local callback listener address.`,
      "  CFHUB_OAUTH_REDIRECT_HOST OAuth redirect host.",
    ]),
  };
  return map[resource] || null;
}
