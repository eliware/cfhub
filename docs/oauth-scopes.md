# OAuth access

OAuth lets cfhub access Cloudflare through a browser login. Run `cfhub oauth login` and follow the browser steps.

## Callback addresses

If you use your own OAuth client, add these callback addresses to it:

```text
http://127.0.0.1:1120/oauth/callback
http://127.0.0.1:1121/oauth/callback
http://127.0.0.1:1122/oauth/callback
http://127.0.0.1:1123/oauth/callback
http://127.0.0.1:1124/oauth/callback
```

cfhub tries these TCP ports in order. The callback path is `/oauth/callback`.

Set `CFHUB_OAUTH_CLIENT_ID` to use a different client ID. Set `CFHUB_OAUTH_BIND_HOST` to select the local listener address. Set `CFHUB_OAUTH_REDIRECT_HOST` to select the host in the callback address. Keep the redirect host reachable from the browser.

Keep the callback ports available during login. The login command tries the ports in order when a port is busy.

## Scopes

The scope picker opens by default. Select the permissions required by your commands. The picker always requests `user-details.read` and `zone.read`.

Set `CFHUB_OAUTH_SCOPES`, or pass `--scope` or `--scopes`, to add and preselect scopes. These options do not replace the required scopes. Select more permissions in the picker before you authorize.

Pass `--no-scope-picker` to skip the picker. In that mode, cfhub requests the built-in scopes that follow, plus any scopes that you configured:

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

Request only scopes that your commands require. Cloudflare must allow each scope on the OAuth client.

Select **Keep me logged in** in the picker to request the `offline_access` scope. This option is off by default. The OAuth client must support refresh tokens.

## Manage OAuth access

Run `cfhub oauth status` to check the active session. Run `cfhub oauth verify` to test access. Run `cfhub oauth list` to list profiles. Run `cfhub oauth switch --profile <name>` to select one. Run `cfhub oauth logout --profile <name>` to remove one.

See [Profiles and settings](configuration.md) for credential storage and profile selection.
