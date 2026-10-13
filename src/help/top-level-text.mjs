export const TOP_LEVEL_HELP = `Manage Cloudflare from the command line.

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
  'cfhub alias set' when needed.`;
