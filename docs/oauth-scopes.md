# OAuth access

OAuth lets cfhub access Cloudflare through a browser login. Run `cfhub oauth login` and follow the browser steps.

## Callback addresses

Register these callback addresses with your OAuth client:

```text
http://127.0.0.1:8765/oauth/callback
http://127.0.0.1:8766/oauth/callback
http://127.0.0.1:8767/oauth/callback
http://127.0.0.1:8768/oauth/callback
http://127.0.0.1:8769/oauth/callback
```

cfhub tries these ports in order. Set `CFHUB_OAUTH_CLIENT_ID` to use a different client ID.

## Scopes

The built-in client asks for these scopes by default:

```text
account-settings.read
user-details.read
zone.read
zone.write
zone-settings.read
zone-settings.write
dns.read
dns.write
account-rulesets.read
account-rulesets.write
account-rule-lists.read
account-rule-lists.write
zone-waf.read
zone-waf.write
ssl-and-certificates.read
ssl-and-certificates.write
cache.purge
healthcheck.read
healthcheck.write
account-logs.read
load-balancing-monitors-and-pools.read
load-balancing-monitors-and-pools.write
argotunnel.read
argotunnel.write
workers-scripts.read
workers-scripts.write
workers-scripts.bind
page.read
page.write
workers-r2.read
workers-r2.write
d1.read
d1.write
queues.read
queues.write
stream.read
stream.write
images.read
images.write
ai.read
ai.write
access.read
access.write
```

Set `CFHUB_OAUTH_SCOPES` to a comma-separated list when you need a different set. Request only scopes that your commands need. Cloudflare must allow each scope on the client.

## Manage OAuth access

Run `cfhub oauth status` to check the active session. Run `cfhub oauth verify` to test access. Run `cfhub oauth list` to list profiles. Run `cfhub oauth switch --profile <name>` to select one. Run `cfhub oauth logout --profile <name>` to remove one.

See [Profiles and settings](configuration.md) for credential storage and profile selection.
