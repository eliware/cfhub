# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## cfhub [![npm version](https://img.shields.io/npm/v/cfhub.svg)](https://www.npmjs.com/package/cfhub) [![license](https://img.shields.io/github/license/eliware/cfhub.svg)](LICENSE) [![build status](https://github.com/eliware/cfhub/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/cfhub/actions)

Cloudflare administration CLI for inspecting and managing zones, DNS, rules, settings, lists, and account services. `cfhub` is designed to feel familiar to anyone who uses the GitHub CLI: commands are composable, automation-friendly, and safe by default.

## Features

- Zone, DNS, rules, settings, lists, and account-service management.
- Read-only health, audit, inventory, SSL, Origin CA, and cache tooling.
- Direct access to any Cloudflare API endpoint through `cfhub api`.
- Human-readable tables and JSON output with jq-style selection and templates.
- Safe writes with `--dry-run`, explicit confirmation for destructive operations, and automation-friendly output.
- API-token and OAuth authentication with named profiles and secure credential storage.
- Multiple named profiles with switch, status, verify, list, and logout commands.
- Account resource commands for load balancers, tunnels, Workers, Pages, R2, D1, Queues, Stream, Images, AI, and Access.
- GitHub CLI-style help, aliases, typo suggestions, and command discovery.
- Dependency-injected ESM architecture with an extension/plugin contract and example extension.

## Requirements

- Node.js 26 or newer.
- A Cloudflare account and either a scoped API token or permission to authorize the optional OAuth client.
- Account and zone IDs for commands that need an explicit scope when defaults are not configured.

## Installation

Install the published package:

```sh
npm install --global cfhub
```

Or install from source:

```sh
git clone https://github.com/eliware/cfhub.git
cd cfhub
npm install
npm link
```

Verify the installation:

```sh
cfhub --version
cfhub --help
```

## Credentials

For normal CLI use, create a scoped Cloudflare API token and save it:

```sh
cfhub auth login
```

`cfhub auth login` prints a short setup guide and prompts for the token with
hidden input. Credentials are stored in the operating system keychain when
available, with a private disk fallback otherwise. Use `--token-stdin` for
headless automation.

The interactive setup follows Cloudflare’s current Account API Token flow:

1. Open **Manage account > Account API tokens**.
2. Choose **Create Token**, enter a name, and select an appropriate policy
   such as Read all resources, Write all resources, Edit Cloudflare Workers,
   Edit zone DNS, or a custom policy.
3. Set expiration and optional client IP filtering, then choose **Review
   Token**, scroll down, and choose **Create Token**.
4. Paste the one-time token into cfhub, then provide the Cloudflare Account ID
   when prompted.

After login, cfhub verifies the token. For user-owned tokens it also loads the
token's Cloudflare permission groups when the token permits token-details
access, stores a read/write/other summary, and blocks commands whose required
permissions are known to be absent. Account-owned tokens can be verified but
Cloudflare does not expose their permission policy through verification, so
those commands use friendly authorization-error guidance instead of claiming a
complete permission inventory.

OAuth is also supported through the separate `oauth` resource:

```sh
cfhub oauth login
cfhub oauth status
cfhub oauth logout --profile work
```

### Default OAuth client

Running `cfhub oauth login` uses the public Eliware OAuth client built into the
CLI. The command starts a temporary local OAuth web server, opens the scope
picker, and then sends the selected authorization request to Cloudflare. The
client can request only scopes enabled in its Cloudflare registration, so the
picker's selections are limited by that registration.

### Use your own OAuth client

You can register and manage a Cloudflare OAuth client in your own account or
organization. This is useful for teams that want their own application identity
or a different set of approved scopes:

1. Create an OAuth application in Cloudflare.
2. Enable the authorization-code response type (`Code`), rather than an
   implicit token response.
3. Register `http://127.0.0.1:8765/oauth/callback` as the redirect URL. If the
   registration accepts multiple redirect URLs, also add ports `8766` through
   `8769`; `cfhub` uses those ports when an earlier one is busy.
4. Select all scopes the client is allowed to request. The scope picker can
   select permissions only when the Cloudflare client registration permits
   them.
5. Start the normal login command with the client ID:

```sh
CFHUB_OAUTH_CLIENT_ID=your-client-id cfhub oauth login
```

There is no separate OAuth-server command: `cfhub oauth login` starts the
temporary server automatically. The default browser redirect remains
`127.0.0.1`; for remote access, the server can bind on all interfaces while
the registered redirect remains local to the browser:

```sh
CFHUB_OAUTH_CLIENT_ID=your-client-id \
CFHUB_OAUTH_BIND_HOST=0.0.0.0 \
CFHUB_OAUTH_REDIRECT_HOST=127.0.0.1 \
cfhub oauth login
```

The client ID environment variable overrides the built-in Eliware client for
that login only. Do not commit client credentials, tokens, or `.env` files.

For headless automation, provide an API token through standard input:

```sh
printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --profile ci --token-stdin
```

Use profiles to separate accounts or automation contexts:

```sh
cfhub oauth list
cfhub oauth status
cfhub oauth switch --profile work
cfhub oauth verify
cfhub oauth logout --profile work
```

An unauthenticated command reports that the user is not logged in and directs them to `cfhub auth login`.

The CLI checks npm for a newer version at most once per day. The check is
best-effort, does not delay commands, and never updates automatically. Disable
it with `CFHUB_NO_UPDATE_CHECK=1` or permanently with:

```sh
cfhub config set update-check false
```

## Configuration

Environment variables may be supplied directly, through a local `.env`, or as optional defaults in the project configuration:

```env
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ZONE_ID=your_zone_id
```

Profiles are stored in the `~/.config/cfhub` configuration directory, while secrets are stored in the OS keychain when available. Existing environment variables take precedence over profile values. Keep tokens, `.env` files, keychain exports, and generated state private; none should be committed.

If an OS keychain is unavailable, credentials are stored in
`~/.config/cfhub/credentials.json` with `0600` permissions. This file contains
the refresh token and expiry metadata needed to renew access tokens; protect it
like any other credential file and exclude it from backups or shared home
directories. Profile metadata never stores OAuth access or refresh tokens.

## Usage

Inspect zones and DNS records:

```sh
cfhub zones list
cfhub zones get --zone-id <zone_id>
cfhub dns-records list --zone-id <zone_id>
cfhub dns-records get --zone-id <zone_id> --id <record_id> --output json
```

Create or preview a DNS change:

```sh
cfhub dns-records create --zone-id <zone_id> \
  --data '{"type":"A","name":"www","content":"192.0.2.1"}' \
  --dry-run
```

Destructive operations require explicit confirmation:

```sh
cfhub dns-records delete --zone-id <zone_id> --id <record_id> --force
```

Use JSON, jq selection, templates, or dashboard links in automation:

```sh
cfhub zones list --json
cfhub zones list --json --jq '.result[]'
cfhub api /zones --json --jq '.result[].name'
cfhub api /zones --json --template '{{.result}}'
cfhub zones get --zone-id <zone_id> --web
```

Access the full Cloudflare API when a built-in command is not available:

```sh
cfhub api /zones
cfhub api zones/<zone_id>/dns_records --method POST \
  --data '{"type":"TXT","name":"example.com","content":"hello"}'
```

Run `<resource> --help` or `<resource> <command> --help` for detailed command-specific help. Singular aliases such as `cfhub zone`, `cfhub dns`, `cfhub rules`, and `cfhub list` are supported.

## Extensions

Extensions add local commands without changing the built-in CLI. The repository includes an example extension and documents the extension manifest and handler contract:

```sh
cfhub extension list
cfhub extension install --path examples/extensions/hello
cfhub hello --name Eli
```

See [docs/extensions.md](docs/extensions.md) for the extension contract and [docs/gh-orientation.md](docs/gh-orientation.md) for the GitHub CLI familiarity guide.

## Development

Install dependencies and run the validation suite:

```sh
npm install
npm test
npm run lint
npm run test:gaps
npm run build:web
npm run pack
```

The OAuth pages keep their readable source stylesheets in `src/oauth-web/`.
Run `npm run build:web` after editing them to regenerate the minified bundles
served by the local OAuth server; `npm pack` runs that build automatically.

The test suite uses dependency injection for Cloudflare clients, filesystem access, environment loading, output, handlers, and process exits. Browser checks for the OAuth web interface are available without authenticating:

```sh
npm run test:e2e:screenshots
npm run test:e2e:lighthouse
npm run test:e2e:web
```

Screenshots and Lighthouse reports are written under the ignored `artifacts/` directory. Puppeteer is a development dependency and the local web test page can simulate the OAuth picker and callback result states.

## Project structure

- `bin/` - executable CLI entry point.
- `src/cli.mjs` - dependency-injected command runtime.
- `src/handlers/` - built-in resource and authentication handlers.
- `src/oauth-web/` - standalone OAuth picker and callback pages.
- `src/` - argument, environment, API, profile, output, and extension utilities.
- `examples/extensions/` - example extension.
- `tests/` - unit and integration tests.
- `tests/e2e/` - Puppeteer and Lighthouse checks.
- `dream.md` - product vision.
- `dream_sprints.md` - roadmap.

## Support

For help, questions, or community chat:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)  
**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[ISC © 2026 Eli Sterling, eliware.org](LICENSE)

## Links

- [Project Home](https://eliware.org/cfhub)
- [Privacy Policy](https://eliware.org/cfhub/policy)
- [Terms of Service](https://eliware.org/cfhub/tos)
- [GitHub Repository](https://github.com/eliware/cfhub)
- [GitHub Organization](https://github.com/eliware)
- [npm Package](https://www.npmjs.com/package/cfhub)
- [Discord](https://discord.gg/M6aTR9eTwN)
