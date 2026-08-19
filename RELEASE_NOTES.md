# Release Notes

## 1.0.5

- Fixed CSS-only OAuth webpack entries producing empty JavaScript bundle files
  during tagit releases by configuring the output as ES modules.

## 1.0.4

- Added current Cloudflare Account API Token setup guidance to interactive login.
- Migrated supported zone, DNS, settings, ruleset, list, inventory, and health
  operations to verified raw Cloudflare API endpoints while preserving legacy
  injected-client compatibility for tests and integrations.
- Added opt-in live validation for real-token reads and non-mutating dry-run
  write paths, with account-wide inventory scanning disabled by default.
- Updated handler fixtures and maintained complete automated coverage.
- Updated Cloudflare, build, lint, and browser-test dependencies.

## 1.0.3

- Completed the remaining CLI branding transition from `cf` to `cfhub`, including OAuth pages, update notices, tests, and the credential keychain service namespace.
- Improved the OAuth browser experience with better contrast, reduced layout shift, responsive image sizing, CSS minification, gzip compression, cache headers, and versioned static assets.
- Restricted the publish workflow to `v*` tags and validated the browser flows with Lighthouse and screenshot tests.

## 1.0.2

- Added opt-in OAuth `offline_access` support through the “Keep me logged in” picker option.
- Persisted OAuth access, refresh, and expiry metadata in the OS keychain when
  available, with a secure `0600` disk fallback when it is not.
- Automatically refreshes expiring OAuth credentials and removes expired
  profiles that have no refresh token.
- Added synchronized session controls above both OAuth login buttons and
  tightened the picker layout for desktop and mobile screens.
- Updated Puppeteer to 25.7.0.

## 1.0.1

- Updated product branding and project links from `cf` to `cfhub` across the
  package metadata, documentation, and OAuth web pages.

## 1.0.0

`cfhub` is an OAuth-first command-line tool for Cloudflare administration. It
provides a familiar, automation-friendly interface for inspecting and safely
managing Cloudflare resources.

### Baseline feature set

- OAuth login with a browser-based scope selector.
- OAuth profiles with profile switching, status, verification, and logout.
- OS keychain-backed credential storage.
- Environment-variable and token-stdin authentication for automation.
- Cloudflare zones: list, inspect, create, update, and delete.
- DNS records: list, inspect, create, update, delete, diff, and apply.
- Zone settings and SSL configuration management.
- Ruleset inspection and management.
- Cloudflare lists and list items.
- Health checks, audit reports, inventory, cache, and Origin CA commands.
- Direct Cloudflare API access through `cfhub api`.
- Human-readable tables and JSON output with filtering and templates.
- Dry-run support for supported write operations.
- `--force` protection for destructive operations.
- Command aliases, resource-specific help, and shell completions.
- Local extension discovery and installation support.
- Daily npm update checks, with an option to disable them.
- Cross-platform support for Windows, macOS, and Linux.

### Quality and safety

- Credential-free automated test suite with full source coverage.
- Static linting and test-gap validation.
- Dependency-injected filesystem, environment, output, and process behavior.
- Secrets are kept out of source, logs, fixtures, and generated artifacts.
- Package validation is performed before release.
