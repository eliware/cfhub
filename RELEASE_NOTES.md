# Release Notes

## 12.0.1 — 2026-10-14

### Fixed

- Fixed update checks and install instructions to use the scoped `@eliware/cfhub` package.

## 12.0.0 — 2026-10-14

### Added

- Added commands for Cloudflare account services, audit reports, inventory, health checks, cache, SSL, certificates, and load balancing.
- Added commands for Tunnels, Workers, Pages, R2, D1, Queues, Stream, Images, Workers AI, and Access.
- Added a direct API command with request bodies, pagination, JSON selection, and templates.
- Added command aliases, profiles, settings, and local extension management.
- Added OAuth scope selection, browser pages, account summaries, profile management, and token refresh support.
- Added secure credential storage through the operating system keychain or private files.
- Added user guides, OAuth assets, browser checks, and test fixtures for source modules.

### Changed

- Published the package as `@eliware/cfhub` with `@eliware/common` and `@eliware/test`.
- Required Node.js 26 and aligned package metadata with Eliware Convention 12.
- Reorganized command, OAuth, output, and web code into focused modules with matching tests.
- Moved build, test, and live-check tools into `bin/` and `test-fixtures/`.
- Added CI validation, tagged-release publishing, and deployment workflows.
- Changed the license from ISC to MIT.

### Fixed

- Fixed OAuth profile selection, scope checks, callback handling, token refresh, and local login pages.
- Fixed API pagination, dry-run behavior, command validation, and destructive-action checks.
- Fixed extension source checks, path validation, upgrades, and build error reports.
- Fixed account inventory limits and zone reports for clients without generic API methods.
- Fixed DNS writes, OAuth forms, browser launch, and web asset loading.

## 1.0.5 — 2026-08-19

### Fixed

- Fixed empty OAuth release bundles by configuring webpack output as ES modules.

## 1.0.4 — 2026-08-19

### Added

- Added Cloudflare Account API token setup guidance.
- Added dry-run checks for real-token reads and write previews.

### Changed

- Moved resource operations to verified Cloudflare API endpoints.
- Updated Cloudflare, build, lint, and browser-test dependencies.

## 1.0.3 — 2026-08-15

### Added

- Added OAuth browser checks with Lighthouse and screenshot reports.

### Changed

- Updated product branding and links from `cf` to `cfhub`.
- Improved OAuth layout, styles, compression, caching, and asset versioning.

## 1.0.2 — 2026-08-14

### Added

- Added optional OAuth `offline_access` support.
- Added secure storage for OAuth refresh tokens and expiry data.

### Changed

- Improved session controls and the OAuth picker layout.
- Updated Puppeteer to 25.7.0.

## 1.0.1 — 2026-08-12

### Changed

- Updated product branding and project links from `cf` to `cfhub`.

## 1.0.0 — 2026-08-12

### Added

- Added Cloudflare zone, DNS, rules, settings, list, and account commands.
- Added API token login, profiles, dry-run writes, and confirmation for deletes.
- Added JSON output, OAuth login, command help, and local extensions.
