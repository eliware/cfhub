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

- Manage zones, DNS, settings, rules, lists, and Cloudflare account services.
- Inspect audits, inventory, SSL, certificates, and cache state.
- Call Cloudflare API endpoints with `cfhub api`.
- Filter JSON fields and format output with templates.
- Preview writes with `--dry-run`. Confirm destructive actions with `--force`.
- Use API tokens, OAuth profiles, and local extensions.

## Requirements

- Install Node.js 26 or later.
- Use a Cloudflare account and a scoped API token or OAuth access.
- Set account or zone IDs when a command needs them.

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

Run `cfhub auth login` to save an API token. Run `cfhub oauth login` to use OAuth.

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

Read [docs/README.md](docs/README.md) for setup, profile, command, output, and extension guides. Read [docs/web-preview.md](docs/web-preview.md) to inspect the OAuth picker. Read [specs/README.md](specs/README.md) for project rules. Read [RELEASE_NOTES.md](RELEASE_NOTES.md) for version history.

## Development

Install dependencies and build the OAuth pages:

```sh
npm ci
npm run puppeteer
npm run build
```

Use `.env` for local defaults. See the configuration guide in [docs/README.md](docs/README.md).

## Testing

Run checks from the repository root:

```sh
npm test
```

### Browser checks

Run browser checks for the OAuth pages with `npm run test:e2e:web`.

Install Node.js 26 or later. Run `npm ci` from the repository root. Install Chrome, Edge, or Chromium. Set `CHROME_PATH` to the browser executable if cfhub cannot find it.

Make local TCP ports 8765 through 8769 available. The checks start OAuth preview servers on these ports. They use a preview client and a mock token response. They do not require Cloudflare credentials.

The screenshot checks capture the OAuth picker, success, cancellation, and expired-request pages. They use desktop, mobile, and mobile landscape viewports. By default, they write PNG files to `artifacts/oauth-screenshots/`. Set `CFHUB_SCREENSHOT_DIR` to change this folder.

The Lighthouse check writes `report.html` and `report.json` to `artifacts/oauth-lighthouse/`. Set `CFHUB_LIGHTHOUSE_DIR` to change this folder. The command prints performance, accessibility, best-practices, and SEO scores.

Confirm success when the command exits with code 0 and prints the screenshot path, report path, and Lighthouse scores.

## Troubleshooting

Run `cfhub auth login` or `cfhub oauth login` when cfhub reports no active login. Use a token with the required Cloudflare permissions when a request fails.

## Security

Keep API tokens, OAuth credentials, and `.env` files private. cfhub uses the operating system keychain when available.

## Configuration

Set optional environment values such as `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_ZONE_ID`. See [docs/README.md](docs/README.md) for profile and storage details.

## Operations

Run `cfhub auth status` to view login status. Run `cfhub config set update-check false` to disable the daily update check.

## Commands

Run `cfhub --help` to list commands. Run `cfhub <resource> --help` for actions. See [docs/commands.md](docs/commands.md) for the resource list.

## Exit codes

cfhub returns 0 after success. It returns 1 after a command or API error.

## Routes

The local OAuth server serves login pages and receives OAuth callbacks.

## Assets

OAuth page sources and images live in `src/oauth-web/`.

## Development server

Run `npm run start:web` to start the OAuth picker preview on port 1020. The server binds to `127.0.0.1` by default.

`cfhub oauth login` starts a temporary callback server. It tries ports 8765 through 8769.

## Build

Run `npm run build` after OAuth page or style changes. Webpack writes bundles to `dist/`. The preview server uses those files when they exist.

## Deployment

cfhub runs as a local CLI. The OAuth server runs on your computer during login.

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
