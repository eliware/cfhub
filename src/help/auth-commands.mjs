import { API_TOKEN_TUTORIAL } from "./auth-token-tutorial.mjs";

export function authCommandHelp(key) {
  const map = {
    "auth login": `Save a Cloudflare API token profile.

USAGE
  cfhub auth login [flags]

  ${API_TOKEN_TUTORIAL.replaceAll("\n", "\n  ")}
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
  };
  return map[key] || null;
}
