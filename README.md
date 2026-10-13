# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/cfhub [![npm](https://img.shields.io/npm/v/@eliware/cfhub)](https://www.npmjs.com/package/@eliware/cfhub) [![License](https://img.shields.io/github/license/eliware/cfhub)](https://github.com/eliware/cfhub/blob/main/LICENSE) [![CI](https://github.com/eliware/cfhub/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/cfhub/actions/workflows/ci.yaml)

Cloudflare administration and automation CLI with GitHub CLI-style commands, profiles, safe writes, and direct API access.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Configuration](#configuration)
- [Operations](#operations)
- [Commands](#commands)
- [Exit codes](#exit-codes)
- [Routes](#routes)
- [Assets](#assets)
- [Development server](#development-server)
- [Build](#build)
- [Deployment](#deployment)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

- Manage Cloudflare zones, DNS, settings, rules, lists, and account services.
- Inspect health, audit, inventory, SSL, Origin CA, and cache state.
- Call any Cloudflare API endpoint with `cfhub api`.
- Select JSON fields and render command output as templates.
- Preview writes with `--dry-run`. Confirm destructive actions with `--force`.
- Sign in with API tokens or OAuth profiles.
- Extend the CLI with local commands.

## Requirements

- Use Node.js 26 or later.
- Use a Cloudflare account and a scoped API token or OAuth access.
- Provide account or zone IDs when a command needs a scope.

## Setup

Install the public package:

```sh
npm install --global @eliware/cfhub
```

Or install from source:

```sh
git clone https://github.com/eliware/cfhub.git
cd cfhub
npm ci
npm link
```

Save a scoped API token with `cfhub auth login`. Use `cfhub oauth login` for OAuth access.

## Usage

List zones and DNS records:

```sh
cfhub zones list
cfhub zones get --zone-id <zone_id>
cfhub dns-records list --zone-id <zone_id>
```

Preview a DNS write:

```sh
cfhub dns-records create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"192.0.2.1"}' --dry-run
```

Delete a DNS record with confirmation:

```sh
cfhub dns-records delete --zone-id <zone_id> --id <record_id> --force
```

Select JSON output:

```sh
cfhub zones list --json --jq '.result[].name'
cfhub api /zones --json --template '{{.result}}'
```

Read [RELEASE_NOTES.md](RELEASE_NOTES.md) for version history. Read [docs/extensions.md](docs/extensions.md) for the extension contract.

## Development

Install dependencies and build OAuth web assets:

```sh
npm ci
npm run build:web
```

Use `.env` for local defaults. Set `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, or `CLOUDFLARE_ZONE_ID` when needed.

## Testing

Run validation from the repository root:

```sh
npm test
npm run lint
npm run audit
npm run format:check
npm run pack
```

Run browser checks with `npm run test:e2e:web`. The checks save reports under the ignored `artifacts/` directory.

## Troubleshooting

If a command reports that you are not logged in, run `cfhub auth login` or `cfhub oauth login`.

If a command reports missing permissions, create a token with the required Cloudflare permissions.

If OAuth port 8765 is busy, cfhub checks ports 8766 through 8769.

## Security

Keep API tokens, OAuth credentials, and `.env` files private. Store credentials in the operating system keychain when available.

The CLI stores profile data under `~/.config/cfhub`. It uses a private file for credentials when no keychain is available.

## Configuration

Set optional defaults in `.env`:

```env
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ZONE_ID=your_zone_id
```

Environment values take precedence over profile values. Use named profiles for separate accounts.

## Operations

Use `cfhub auth login` to save an API token. Use `cfhub oauth login` to start the local OAuth flow.

Use `cfhub auth status`, `cfhub auth verify`, and `cfhub auth logout` to manage authentication.

Use `cfhub config set update-check false` to disable the daily package update check.

## Commands

Run `cfhub --help` to list resources. Run `cfhub <resource> --help` for resource actions.

Read the [documentation index](docs/README.md) for guides and command references.

## Exit codes

The CLI returns 0 after success. It returns 1 after command or API errors.

## Routes

The local OAuth server serves the picker, result, and success pages. It receives OAuth callbacks at `127.0.0.1`.

## Assets

OAuth page sources and image assets live in `src/oauth-web/`. The server serves these files during login.

## Development server

`cfhub oauth login` starts a temporary local web server. The default redirect port is 8765. The CLI tries ports 8766 through 8769 when needed.

## Build

Run `npm run build:web` after you edit OAuth page sources or styles. The build writes browser bundles under `src/oauth-web/bundled/`.

## Deployment

cfhub does not deploy a hosted web service. The OAuth server runs on the user's computer during login.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/cfhub)
- [Bug Reports](https://github.com/eliware/cfhub/issues)
- [npm](https://www.npmjs.com/package/@eliware/cfhub)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
