# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## cfhub [![npm version](https://img.shields.io/npm/v/cfhub.svg)](https://www.npmjs.com/package/cfhub) [![license](https://img.shields.io/github/license/eliware/cfhub.svg)](LICENSE) [![build status](https://github.com/eliware/cfhub/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/cfhub/actions)

An OAuth-first Cloudflare administration CLI for inspecting and managing zones, DNS, rules, settings, lists, and account services. `cfhub` is designed to feel familiar to anyone who uses the GitHub CLI: commands are composable, automation-friendly, and safe by default.

## Features

- OAuth browser login with a guided scope picker and OS keychain storage.
- API-token login for headless automation with `--token-stdin`.
- Multiple named profiles with switch, status, verify, list, and logout commands.
- Zone, DNS record, zone setting, ruleset, Cloudflare list, and list-item commands.
- Account resource commands for load balancers, tunnels, Workers, Pages, R2, D1, Queues, Stream, Images, AI, and Access.
- Read-only health, audit, inventory, SSL, Origin CA, and cache commands.
- `cfhub api` for direct access to any Cloudflare API endpoint.
- Human-readable and JSON output, including `--jq` and templates.
- `--dry-run` for supported writes and `--force` for destructive operations.
- GitHub CLI-style help, aliases, typo suggestions, and command discovery.
- Dependency-injected ESM architecture with an extension/plugin contract and example extension.

## Requirements

- Node.js 26 or newer.
- A Cloudflare account and permission to authorize the Eliware OAuth client, or an API token for automation.
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

## Authentication

Interactive users should start the OAuth flow:

```sh
cfhub auth login
```

The local web interface lets users select the scopes they need before authorizing with Cloudflare. Access and refresh credentials are stored in the operating system keychain when available. The callback page confirms success or failure and then the temporary local server shuts down.

### Default OAuth client

Running `cfhub auth login` uses the public Eliware OAuth client built into the
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
CF_OAUTH_CLIENT_ID=your-client-id cfhub auth login
```

There is no separate OAuth-server command: `cfhub auth login` starts the
temporary server automatically. The default browser redirect remains
`127.0.0.1`; for remote access, the server can bind on all interfaces while
the registered redirect remains local to the browser:

```sh
CF_OAUTH_CLIENT_ID=your-client-id \
CF_OAUTH_BIND_HOST=0.0.0.0 \
CF_OAUTH_REDIRECT_HOST=127.0.0.1 \
cfhub auth login
```

The client ID environment variable overrides the built-in Eliware client for
that login only. Do not commit client credentials, tokens, or `.env` files.

For headless automation, provide an API token through standard input:

```sh
printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --profile ci --token-stdin
```

Use profiles to separate accounts or automation contexts:

```sh
cfhub auth list
cfhub auth status
cfhub auth switch --profile work
cfhub auth verify
cfhub auth logout --profile work
```

An unauthenticated command reports that the user is not logged in and directs them to `cfhub auth login`, matching the familiar GitHub CLI workflow.

The CLI checks npm for a newer version at most once per day. The check is
best-effort, does not delay commands, and never updates automatically. Disable
it with `CF_NO_UPDATE_CHECK=1` or permanently with:

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

OAuth profiles are stored in the `~/.cfhub` configuration directory, while secrets are stored in the OS keychain. Existing environment variables take precedence over profile values. Keep tokens, `.env` files, keychain exports, and generated state private; none should be committed.

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
npm run pack
```

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
