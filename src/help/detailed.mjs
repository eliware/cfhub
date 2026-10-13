import { detailedExamples } from "./detailed-examples.mjs";
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

${detailedExamples()}`);
}
