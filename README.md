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

Use `cfhub` to manage Cloudflare resources, inspect account state, and call API endpoints.
Use API-token or OAuth profiles. Preview supported writes with `--dry-run` and confirm destructive actions with `--force`.

## Requirements

- Install Node.js 26 or later.
- Use a Cloudflare account and a scoped API token or OAuth access.
- Set account or zone IDs when a command needs them.

## Setup

Install the public package:

```sh
npm install --global @eliware/cfhub
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

Read [docs/README.md](docs/README.md) for user guides. Read [specs/README.md](specs/README.md) for project rules. Read [RELEASE_NOTES.md](RELEASE_NOTES.md) for version history.

## Development

Install dependencies before you run repository checks:

```sh
npm ci
```

Read [AGENTS.md](AGENTS.md) and the [specifications index](specs/README.md) before you change files.

## Testing

Run aggregate checks from the repository root:

```sh
npm test
```

Run `npm run test:e2e:web` for OAuth browser checks. Read [Web preview](docs/web-preview.md) for browser setup, ports, and output files.

## Troubleshooting

Read [Setup and first use](docs/getting-started.md) when login fails. Check that the token has the required Cloudflare permissions when a request fails.

## Security

Keep API tokens, OAuth credentials, and local configuration files private. cfhub uses the operating system keychain when available.

## Configuration

Read [Profiles and settings](docs/configuration.md) for environment values, profiles, and storage paths.

## Operations

Run `cfhub auth status` to view login status. Read [Profiles and settings](docs/configuration.md) to control daily update checks.

## Commands

Run `cfhub --help` to list commands. Run `cfhub <resource> --help` for actions. Read [the command reference](docs/commands.md) for command groups and global options.

## Exit codes

cfhub returns 0 after success. It returns 1 after a command or API error.
After SIGINT, cfhub exits with code 130. After SIGTERM, it exits with code 143.

## Routes

The local OAuth server provides these routes when the scope picker is enabled:

- `GET /` returns the scope picker.
- `POST /oauth/start` accepts the selected scopes and redirects to Cloudflare.
- `GET /api/version?project=cfhub` returns the package version.
- `GET /oauth-picker.css`, `/oauth-picker-app.mjs`, and `/picker/*.mjs` return picker files.
- `GET /oauth-web/*` returns the picker logos and images.
- `GET /oauth/callback` receives the OAuth callback.

## Assets

The picker uses bundled files from `src/oauth-web/` and these images from `public/oauth-web/`:
`cf-logo.svg`, `cloudflare-115x53.png`, and `eliware-58x58.png`.

## Development server

Run `npm run start:web` to start the OAuth picker preview on `127.0.0.1:1120`. Read [Web preview](docs/web-preview.md) for browser workflows.

## Build

Run `npm run build` after OAuth page or style changes. Webpack writes bundles to `dist/`.

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
