# AGENTS.md

## Project

Build cfhub, a Cloudflare CLI. Use Node.js 26 and native ESM.

## Scope and boundaries

Manage Cloudflare resources through its API. Keep credentials private. Do not publish, tag, or push without direct user approval.

## Layout

Keep source files in `src/`. Keep the CLI launcher in `bin/`. Keep tests in `tests/`.

## Development

Read `README.md` before behavior changes. Keep handlers small and focused. Use dependency injection for external services. Add tests for behavior changes.

## Validation

Run `npm test`, `npm run lint`, `npm run audit`, `npm run format`, `npm run format:check`, and `npm run pack` from the repository root.

## Security

Require `--force` for destructive actions. Support `--dry-run` for writes where available. Keep credentials out of output, errors, fixtures, and commits.

## Changes

Update user docs when commands or settings change. Keep changes scoped. Check your work before you report completion.

## Application

Run cfhub as a local CLI. Use Cloudflare API tokens or OAuth profiles.

## CLI

Run `cfhub --help` for commands. Run `cfhub <resource> --help` for actions. Preview writes with `--dry-run`. Confirm destructive actions with `--force`.

## Web

Use OAuth pages in `src/oauth-web/`. Run `npm run build:web` after page or style changes.

## npm publication

Run `npm run pack` before publication review. Get direct user approval before you publish.
