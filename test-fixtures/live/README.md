# Live CLI tests

These tests are intentionally excluded from `npm test` and CI. They use the
active local `cfhub` credential profile and may contact Cloudflare.

Run the authenticated read/help smoke tests and all supported non-mutating
`--dry-run` write paths with:

```sh
npm run test:live:dry
```

The suite discovers a zone and account from `cfhub zones list`. Set
`CFHUB_LIVE_ZONE_ID` and `CFHUB_LIVE_ACCOUNT_ID` to select explicit fixtures.

The dry suite makes real Cloudflare read requests. Its write cases stop at
cfhub's dry-run boundary and do not send mutation requests to Cloudflare.
It requires a valid token and the relevant permissions.
Inventory export is skipped by default because it scans every zone in the
account; enable it explicitly with `CFHUB_LIVE_INCLUDE_INVENTORY=1`.

The wet command mutates Cloudflare. It creates and removes a DNS record, an
HTTPS monitor for `eliware.org/health`, and a temporary IP list with an item.
It requires a selected test zone.

```sh
npm run test:live:wet
```

The test uses a unique DNS name and an RFC 5737 documentation IP, then always
attempts cleanup in a `finally` block. Set `CFHUB_LIVE_ZONE_ID` to choose the
disposable test zone.
