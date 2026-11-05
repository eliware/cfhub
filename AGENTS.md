# AGENTS.md

## Project

Eliware owns this repository. cfhub is the Cloudflare administration CLI and OAuth picker.

## Scope and boundaries

Maintain the CLI, OAuth picker, packaged examples, and their validation workflows here.
Keep company-wide requirements in their authoritative specifications.

## Layout

Use README.md and specs/README.md to find maintained files.

## Development

Run `npm ci` to install dependencies before checks.

## Validation

Use Node.js 26 and native ESM for maintained JavaScript modules.
Run npm test for aggregate validation.
Run npm run lint for lint checks.
Run npm run audit for dependency checks.
Run npm run format to format files.
Run npm run format:check to check formatting.

## Security

Keep credentials, secret values, private data, and runtime state out of Git.

## Changes

Update user documentation and RELEASE_NOTES.md when user-visible behavior changes.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Keep `--help` and `--version` read-only.
Document each command, argument, default, error, and exit code.

## Web

Keep route, asset, build, and deployment guidance aligned with maintained code and workflows.

## npm publication

Follow Eliware Operations procedures for npm release authorization.
