# AGENTS.md

## Project

Build cfhub, a Cloudflare administration CLI. Use Node.js 26 and native ESM.

## Scope and boundaries

Manage Cloudflare resources through the Cloudflare API. Keep credentials private. Do not publish, tag, or push without direct user approval.

## Layout

Keep implementation in `src/`. Keep launchers in `bin/`. Keep tests in `tests/`. Keep fixtures in `test-fixtures/`.

## Development

Read `README.md` before behavior changes. Keep handlers small. Use dependency injection for external services and process behavior. Add tests for behavior changes.

## Validation

Run `npm test`, `npm run lint`, `npm run audit`, `npm run format`, `npm run format:check`, and `npm run pack` from the repository root.

## Security

Require `--force` for destructive actions. Support `--dry-run` for writes where available. Do not expose credentials in output, errors, fixtures, or diffs.

## Changes

Update `README.md` when commands or configuration change. Keep changes scoped. Check the result before you report completion.

## Application

Run cfhub as a local Node.js CLI. Use Cloudflare API tokens or OAuth profiles. The CLI has no background service.

## CLI

Run `cfhub --help` for commands. Run `cfhub <command> --help` for command details. Use `--dry-run` before writes. Use `--force` for destructive actions.

## Web

Use the local OAuth pages in `src/oauth-web/`. Run `npm run build:web` after source style or page changes. Browser checks use Puppeteer.

## npm publication

Run `npm run pack` before publication review. The CI workflow validates changes. A user must approve each publication.
