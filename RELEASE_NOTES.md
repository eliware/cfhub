# Release Notes

## 12.0.0 — 2026-10-13

### Added

- Added the `@eliware/common` runtime package and the `@eliware/test` development package.
- Added guides for setup, profiles, commands, safe writes, OAuth, and local extensions.
- Added OAuth web assets and browser checks.

### Changed

- Updated command and OAuth modules while preserving the CLI resource and action model.
- Aligned package metadata, workflows, and project guidance with Eliware Convention 12.
- Moved build and test tools into the `bin/` and `test-fixtures/` folders.

### Fixed

- Fixed inventory and zone reports for clients without a generic SDK request method.
- Fixed OAuth web bundles so the local login pages load their styles and scripts.

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
