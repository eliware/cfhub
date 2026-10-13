export function coreResourceHelp(resource) {
  const map = {
    zones: `zones
  list                 List zones
  get                  Get zone details
  audit                Audit zone metadata, SSL, and DNS
  security             Check zone security baseline
  create               Create zone
  update               Edit zone
  delete               Delete zone`,
    "zone-settings": `zone-settings
  get                  Get one zone setting
  set                  Update one zone setting`,
    "dns-records": `dns-records
  list                 List DNS records
  get                  Get DNS record
  create               Create DNS record
  update               Update DNS record
  delete               Delete DNS record
  diff                 Compare DNS records with desired JSON
  apply                Apply a DNS diff (requires --force)`,
    rulesets: `rulesets
  list                 List rulesets
  get                  Get ruleset
  create               Create ruleset
  update               Update ruleset`,
    lists: `lists
  list                 List lists
  get                  Get list
  create               Create a list
  update               Update a list
  delete               Delete a list (requires --force)`,
    "list-items": `list-items
  list                 List items in a list
  create               Add item to a list
  delete               Delete item from a list`,
    api: `api
  /path                Call any relative Cloudflare API path

  Options: --method GET|POST|PUT|PATCH|DELETE, --data, --file,
  --json, --dry-run, and --force for DELETE`,
    auth: `auth
  login                Save an API token profile (interactive by default)
  status               Verify the active API-token identity
  verify               Verify the active API token
  list                 Show configured credential contexts
  switch               Activate a saved profile
  logout               Remove a saved profile

  The token is stored in the OS keychain when available, or in the local
  credentials fallback. Create a token with the permissions required by the
  commands you use; see https://dash.cloudflare.com/profile/api-tokens.

  --token-stdin        Read the token from standard input
  --profile <name>     Save and activate this profile
  --account-id <id>    Associate an account with the profile
  --zone-id <id>       Associate a zone with the profile`,
    oauth: `oauth
  login                Start the OAuth browser flow
  status               Verify the active Cloudflare identity
  verify               Verify the active API token
  list                 Show configured credential contexts
  switch               Activate a saved profile
  logout               Remove a saved profile

  Login options:
  --profile <name>     Save and activate this profile
  --account-id <id>    Associate an account with the profile
  --zone-id <id>       Associate a zone with the profile
  --scopes <scopes>    Request additional comma-separated OAuth scopes
  --scope <scope>      Request one additional OAuth scope
  --no-scope-picker    Skip the browser scope picker

  Environment:
  CFHUB_OAUTH_CLIENT_ID     Override the public OAuth client
  CFHUB_OAUTH_SCOPES        Comma-separated OAuth scopes
  CFHUB_OAUTH_BIND_HOST     Local callback listener address
  CFHUB_OAUTH_REDIRECT_HOST OAuth redirect host`,
  };
  return map[resource] || null;
}
