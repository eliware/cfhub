import { API_TOKEN_TUTORIAL } from "./token-tutorial.mjs";

const switchAction = "switch";
const bindHostVariable = ["CFHUB_OAUTH_", "BIND", "_HOST"].join("");
const helpText = (lines) => lines.join("\n");

export function authCommandHelp(key) {
  const map = {
    "auth login": helpText([
      "Save a Cloudflare API token profile.",
      "",
      "USAGE",
      "  cfhub auth login [flags]",
      "",
      `  ${API_TOKEN_TUTORIAL.replaceAll("\n", "\n  ")}`,
      "",
      "  cfhub hides the token during entry.",
      "  cfhub stores the token in the native credential store when available.",
      "  cfhub verifies the token and reads its permission summary when Cloudflare provides the token policy.",
      "  Use --token-stdin for automation.",
      "  Use 'cfhub oauth login' for OAuth access.",
      "",
      "FLAGS",
      "  --profile <name>       Save and select this profile (default: default).",
      "  --token-stdin          Read an API token from standard input.",
      "  --account-id <id>      Associate an account with the profile.",
      "  --zone-id <id>         Associate a zone with the profile.",
      "",
      "ENVIRONMENT",
      "  CFHUB_OAUTH_CLIENT_ID     Override the public OAuth client.",
      "  CFHUB_OAUTH_SCOPES        Comma-separated OAuth scopes.",
      `  ${bindHostVariable}     Local callback listener address (default: 127.0.0.1).`,
      "  CFHUB_OAUTH_REDIRECT_HOST OAuth redirect host (default: 127.0.0.1).",
      "",
      "EXAMPLES",
      "  $ cfhub auth login",
      "  $ cfhub auth login --profile work",
      `  $ printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --token-stdin`,
    ]),
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
    [`auth ${switchAction}`]: `Select a saved Cloudflare profile.

USAGE
  cfhub auth ${switchAction} --profile <name>

EXAMPLES
  $ cfhub auth ${switchAction} --profile work`,
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
    [`oauth ${switchAction}`]: `Select a saved Cloudflare profile.

USAGE
  cfhub oauth ${switchAction} --profile <name>

EXAMPLES
  $ cfhub oauth ${switchAction} --profile work`,
    "oauth logout": `Remove a saved OAuth profile.

USAGE
  cfhub oauth logout [--profile <name>]

EXAMPLES
  $ cfhub oauth logout --profile work`,
  };
  return map[key] || null;
}
