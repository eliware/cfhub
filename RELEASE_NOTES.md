# Release Notes

## Unreleased

### Changed

- No changes are pending.

## 12.0.0 — 2026-10-13

### Changed

- Aligned repository metadata, documentation, and workflows with Convention v12.
- Added the Eliware common runtime package and validation package.
- This version is under local review. It is not published.

## 1.0.5 — 2026-08-19

### Fixed

- Fixed empty OAuth release bundles by configuring webpack output as ES modules.

## 1.0.4 — 2026-08-19

### Added

- Added Cloudflare Account API token setup guidance.
- Added dry-run live checks for real-token reads and write previews.

### Changed

- Moved supported resource operations to verified Cloudflare API endpoints.
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
- Added API-token login, profiles, dry-run writes, and confirmation for deletes.
- Added JSON output, OAuth login, command help, and local extensions.
