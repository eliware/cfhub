export function printDetailedHelp(printer = console) {
  printer.log(`cfhub - Cloudflare admin utility

Usage:
  cfhub --help
  cfhub <resource> --help
  cfhub <resource> <action> [options]

Global options:
  --help                 Show help
  --version              Show version
  --json                 Output JSON
  --output <format>      json|text (default text)
  --jq <expression>      Select fields from JSON output (basic jq paths)
  --quiet                Suppress normal command output
  --pager                Pipe human-readable output through the configured pager
  --no-pager             Disable paging for this invocation
  --color <mode>         always|never|auto (default auto)
  --width <columns>      Terminal output width override
  --verbose              Include verbose diagnostics where supported
  --paginate              Fetch all pages for supported list/API requests
  --template <text>       Render JSON values with {{.field}} placeholders
  --web                   Print the Cloudflare dashboard link
  --force                Confirm destructive writes
  --dry-run              Show what would change without writing
  --account-id <id>      Cloudflare account id
  --zone-id <id>         Cloudflare zone id
  --id <id>              Resource id
  --setting <name>       Zone setting name
  --file <path>          Read JSON body from file
  --data <json>          JSON body inline
  --method <method>      API method for cfhub api (default GET)

Use the resource names shown above directly; define personal shortcuts with
'cfhub alias set' when needed.

Resources:
  zones                  List, inspect, create, edit, delete zones
  zone-settings          Read or edit zone settings
  dns-records            List or manage DNS records
  rulesets               List, inspect, create, or update rulesets
  lists                  List Cloudflare lists
  list-items             List or manage list items
  api                    Call any relative Cloudflare API path
  auth                   Save and manage API-token profiles
  oauth                  Manage the OAuth browser authentication flow
  ssl                    Inspect or configure zone SSL/TLS settings
  cache                  Purge zone cache
  health                 Inspect zone health checks
  audit                  Inspect account audit logs
  inventory              Export account inventory
  origin-ca              Manage Origin CA certificates
  load-balancer           Manage zone Load Balancers
  tunnel                  Manage account tunnels
  workers                 Manage Workers resources
  pages                   Manage Pages projects
  r2                      Manage R2 buckets
  d1                      Manage D1 databases
  queues                  Manage Queues
  stream                  Manage Stream resources
  images                  Manage Images
  ai                      Manage AI resources
  access                  Manage Access applications
  extension               Manage local cfhub extensions

Examples:
  cfhub zones list
  cfhub zones get --zone-id <zone_id>
  cfhub zones create --data '{"account":{"id":"..."},"name":"example.com","type":"full"}'
  cfhub zone-settings get --zone-id <zone_id> --setting development_mode
  cfhub zone-settings set --zone-id <zone_id> --setting development_mode --data '{"value":"on"}'
  cfhub dns-records list --zone-id <zone_id>
  cfhub dns-records create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"1.2.3.4"}'
  cfhub rulesets list --zone-id <zone_id>
  cfhub rulesets update --zone-id <zone_id> --id <ruleset_id> --file ruleset.json
  cfhub lists list --account-id <account_id>
  cfhub list-items list --account-id <account_id> --id <list_id>
  cfhub zones list
  cfhub api /zones --json
  cfhub api zones/<zone_id>/dns_records --json
  cfhub auth login
  cfhub oauth status
  cfhub oauth login --profile work                # OAuth browser flow
  printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --profile ci --token-stdin
  cfhub oauth switch --profile work
  cfhub oauth logout --profile work
  cfhub ssl get --zone-id <zone_id>
  cfhub cache purge --zone-id <zone_id> --data '{"purge_everything":true}' --force
  cfhub health list --zone-id <zone_id>
  cfhub audit list --account-id <account_id>
  cfhub inventory export --account-id <account_id> --json
  cfhub origin-ca list --json
`);
}

export function printHelp(printer = console) {
  printer.log(`Manage Cloudflare from the command line.

USAGE
  cfhub <command> <subcommand> [flags]

CORE COMMANDS
  auth:          Save and manage API-token profiles
  oauth:         Manage OAuth browser authentication
  zones:         Manage zones
  dns-records:   Manage DNS records
  zone-settings: Manage zone settings
  rulesets:      Manage rulesets
  lists:         Manage account lists
  ssl:           Inspect and configure SSL/TLS
  api:           Make an authenticated Cloudflare API request

ACCOUNT COMMANDS
  audit:         View account audit logs
  inventory:     Export account inventory
  origin-ca:     Manage Origin CA certificates
  load-balancer: Manage zone Load Balancers
  tunnel:        Manage account tunnels

PLATFORM COMMANDS
  workers:       Manage Workers
  pages:         Manage Pages projects
  r2:            Manage R2 buckets
  d1:            Manage D1 databases
  queues:        Manage Queues
  stream:        Manage Stream
  images:        Manage Images
  ai:            Manage AI and Vectorize
  access:        Manage Access and Zero Trust
  extension:     Manage local cfhub extensions
  alias:          Manage command aliases
  config:         Manage local cfhub settings

FLAGS
  --help         Show help for command
  --version      Show version
  --json         Output JSON
  --output       json|text (default text)
  --jq           Select fields from JSON output
  --template     Render JSON values with {{.field}} placeholders
  --quiet        Suppress normal output
  --pager        Page human-readable output
  --no-pager     Disable paging
  --color        always|never|auto
  --width        Terminal width override
  --verbose      Include diagnostic details
  --paginate     Fetch all supported pages
  --web          Open a Cloudflare dashboard link
  --force        Confirm destructive actions
  --dry-run      Show changes without writing
  --account-id   Cloudflare account id
  --zone-id      Cloudflare zone id
  --file         Read a JSON request body
  --data         Use an inline JSON request body

EXAMPLES
  $ cfhub zones list
  $ cfhub dns-records list --zone-id <zone_id>
  $ cfhub api /zones --json
  $ cfhub auth login
  $ cfhub oauth status
  $ cfhub extension list

LEARN MORE
  Use 'cfhub <command> <subcommand> --help' for more information.
  Use the resource names shown above directly; define personal shortcuts with
  'cfhub alias set' when needed.`);
}

export function printResourceHelp(resource, printer = console) {
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
    ssl: `ssl
  get                  Read a zone SSL/TLS setting
  set                  Update a zone SSL/TLS setting
  certificates         List certificate packs
  coverage             Summarize certificate host coverage`,
    cache: `cache
  purge                Purge zone cache (requires --force)`,
    health: `health
  list                 List zone health checks
  get                  Get a health check
  create               Create a health check
  delete               Delete a health check (requires --force)`,
    audit: `audit
  list                 List account audit logs`,
    inventory: `inventory
  export               Export zones, DNS records, and SSL settings`,
    "origin-ca": `origin-ca
  list                 List Origin CA certificates
  create               Create an Origin CA certificate
  revoke               Revoke a certificate (requires --force)`,
    "load-balancer": `load-balancer
  list/get/create/update/delete  Manage zone Load Balancers`,
    tunnel: `tunnel
  list/get/create/update/delete  Manage account tunnels`,
    workers: `workers
  list                  List Workers scripts
  get --id <name>       Get a Workers script
  create/update         Write a Workers resource (--data or --file)
  delete --id <name>    Delete a Workers resource (requires --force)`,
    pages: `pages
  list/get/create/update/delete  Manage Pages projects`,
    r2: `r2
  list/get/create/update/delete  Manage R2 buckets`,
    d1: `d1
  list/get/create/update/delete  Manage D1 databases`,
    queues: `queues
  list/get/create/update/delete  Manage Queues`,
    stream: `stream
  list/get/create/update/delete  Manage Stream resources`,
    images: `images
  list/get/create/update/delete  Manage Images resources`,
    ai: `ai
  list/get/create/update/delete  Manage AI resources`,
    access: `access
  list/get/create/update/delete  Manage Access applications`,
    extension: `extension
  list                 List installed extensions
  info                 Show installed extension metadata
  install              Install from a local extension directory
  upgrade              Replace an installed extension from a local directory
  remove               Remove an extension (requires --force)`,
    alias: `alias
  list                 List saved command aliases
  set <name> <command> Save a command alias
  delete <name>        Delete a command alias`,
    config: `config
  list                 List saved configuration
  get <name>           Read a configuration value
  set <name> <value>   Save a configuration value
  unset <name>         Remove a configuration value`,
  };
  printer.log(map[resource] || `Unknown resource: ${resource}`);
}

const commandHelp = {
  "auth login": `Save a Cloudflare API token profile.

USAGE
  cfhub auth login [flags]

  The interactive flow explains how to create an Account API Token under
  Manage account > Account API tokens, then asks for the token and Account ID.
  The token uses hidden input and is stored in the native credential store when available.
  cfhub verifies the token and loads its permission summary when Cloudflare
  exposes the token policy. Use --token-stdin for automation.
  The browser-based OAuth flow is available as 'cfhub oauth login'.

FLAGS
  --profile <name>       Save and activate this profile (default: default)
  --token-stdin          Read an API token from standard input
  --account-id <id>      Associate an account with the profile
  --zone-id <id>         Associate a zone with the profile

ENVIRONMENT
  CFHUB_OAUTH_CLIENT_ID     Override the public OAuth client
  CFHUB_OAUTH_SCOPES        Comma-separated OAuth scopes
  CFHUB_OAUTH_BIND_HOST     Local callback listener address (default: 0.0.0.0)
  CFHUB_OAUTH_REDIRECT_HOST OAuth redirect host (default: 127.0.0.1)

EXAMPLES
  $ cfhub auth login
  $ cfhub auth login --profile work
  $ printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --token-stdin
`,
  "oauth login": `Authenticate with Cloudflare using the browser-based OAuth flow.

USAGE
  cfhub oauth login [flags]

The OAuth profile is stored in the native credential store when available.

EXAMPLES
  $ cfhub oauth login --profile work`,
  "auth status": `Show the active Cloudflare identity.

USAGE
  cfhub auth status [flags]

EXAMPLES
  $ cfhub auth status
  $ cfhub auth status --json`,
  "auth switch": `Activate a saved Cloudflare profile.

USAGE
  cfhub auth switch --profile <name>

EXAMPLES
  $ cfhub auth switch --profile work`,
  "auth logout": `Remove a saved Cloudflare profile.

USAGE
  cfhub auth logout [--profile <name>]

EXAMPLES
  $ cfhub auth logout --profile work`,
  "oauth status": `Show the active Cloudflare identity.

USAGE
  cfhub oauth status [flags]

EXAMPLES
  $ cfhub oauth status
  $ cfhub oauth status --json`,
  "oauth switch": `Activate a saved Cloudflare profile.

USAGE
  cfhub oauth switch --profile <name>

EXAMPLES
  $ cfhub oauth switch --profile work`,
  "oauth logout": `Remove a saved OAuth profile.

USAGE
  cfhub oauth logout [--profile <name>]

EXAMPLES
  $ cfhub oauth logout --profile work`,
  "zones list": `List zones available to the active profile.

USAGE
  cfhub zones list [flags]

FLAGS
  --paginate              Fetch all supported pages
  --json                  Emit machine-readable JSON

EXAMPLES
  $ cfhub zones list
  $ cfhub zones list --json`,
  "dns-records list": `List DNS records in a zone.

USAGE
  cfhub dns-records list --zone-id <zone_id> [flags]

FLAGS
  --zone-id <id>          Zone to inspect
  --paginate              Fetch all pages
  --json                  Emit machine-readable JSON

EXAMPLES
  $ cfhub dns-records list --zone-id <zone_id>`,
  "dns-records create": `Create a DNS record.

USAGE
  cfhub dns create --zone-id <zone_id> (--data <json> | --file <path>) [flags]

EXAMPLES
  $ cfhub dns create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"1.2.3.4"}'`,
  "dns-records delete": `Delete a DNS record.

USAGE
  cfhub dns delete --zone-id <zone_id> --id <record_id> --force

The --force flag is required for destructive operations.`,
  api: `Call any relative Cloudflare API path.

USAGE
  cfhub api <path> [flags]

FLAGS
  --method <method>       GET, POST, PUT, PATCH, or DELETE
  --data <json>           Inline JSON request body
  --file <path>           Read JSON request body from a file
  --dry-run               Show the request without writing
  --force                 Required for DELETE requests
  --paginate              Fetch all supported pages

EXAMPLES
  $ cfhub api /zones --json
  $ cfhub api zones/<zone_id>/dns_records --method GET`,
  "cache purge": `Purge a zone's cache.

USAGE
  cfhub cache purge --zone-id <zone_id> --force [flags]

The --force flag is required because this operation cannot be undone.

EXAMPLES
  $ cfhub cache purge --zone-id <zone_id> --data '{"purge_everything":true}' --force`,
  "ssl set": `Update a zone SSL/TLS setting.

USAGE
  cfhub ssl set --zone-id <zone_id> --setting <name> --data <json> [flags]

EXAMPLES
  $ cfhub ssl set --zone-id <zone_id> --setting mode --data '{"value":"strict"}'`,
  "origin-ca revoke": `Revoke an Origin CA certificate.

USAGE
  cfhub origin-ca revoke --id <certificate_id> --force

The --force flag is required for destructive operations.`,
  "extension remove": `Remove an installed extension.

USAGE
  cfhub extension remove <name> --force

The --force flag is required for destructive operations.`,
  "alias set": `Save a command alias.

USAGE
  cfhub alias set <name> <command...>

EXAMPLES
  $ cfhub alias set work 'zones list'`,
  "alias delete": `Delete a saved command alias.

USAGE
  cfhub alias delete <name>

EXAMPLES
  $ cfhub alias delete zones`,
  "config set": `Save a local cfhub configuration value.

USAGE
  cfhub config set <name> <value>`,
  "config unset": `Remove a local cfhub configuration value.

USAGE
  cfhub config unset <name>`,
};

export function printCommandHelp(resource, action, printer = console) {
  const key = `${resource} ${action || ""}`.trim();
  printer.log(
    commandHelp[key] ||
      `${resource} ${action || ""}\n\nUSAGE\n  cfhub ${resource} ${action || "<subcommand>"} [flags]\n\nUse 'cfhub ${resource} --help' for available subcommands.`,
  );
}
