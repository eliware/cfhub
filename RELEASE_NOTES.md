# Release Notes

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
