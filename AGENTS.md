# AGENTS.md

## Project

- Build `@eliware/cfhub` as a Cloudflare CLI.
- Use Node.js 26 or later and native ESM.

## Scope and boundaries

- Manage Cloudflare resources through the Cloudflare API.
- Keep credentials private.
- Do not publish, tag, or push without direct user approval.

## Layout

- Keep source files in `src/`.
- Keep the CLI launcher in `bin/`.
- Keep tests in `tests/`.
- Keep test fixtures in `test-fixtures/`.

## Development

- Read `README.md` before you change behavior.
- Keep each handler focused.
- Inject external services into modules.
- Add tests for behavior changes.

## Validation

- Run `npm test` for aggregate validation.
- Run `npm run lint` for lint checks.
- Run `npm run audit` for dependency checks.
- Run `npm run format` to format files.
- Run `npm run format:check` to check formatting.
- Run `npm run pack` to check the package.

## Security

- Require `--force` for destructive actions.
- Support `--dry-run` for supported writes.
- Keep credentials out of output, errors, fixtures, and commits.

## Changes

- Update user docs when commands or settings change.
- Keep changes scoped.
- Check your work before you say that the task is complete.

## Application

- Run focused tests first during development.
- Run one test file with `npm test -- tests/path/to/example.test.mjs`.
- Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
- Prevent repeated full-suite runs during development.
- Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

- Run `cfhub --help` to list commands.
- Run `cfhub <resource> --help` to list actions.
- Pass `--dry-run` to preview writes.
- Pass `--force` to confirm destructive actions.

## Web

- Use OAuth pages in `src/oauth-web/`.
- Run `npm run build:web` after page or style changes.

## npm publication

- Run `npm run pack` before you request publication approval.
- Do not publish without direct user approval.
