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
