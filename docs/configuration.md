# Profiles and settings

cfhub reads access values from environment variables and saved profiles. Environment values override profile values.

## Environment values

Set these values for commands that require them:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
CLOUDFLARE_PROFILE
```

Put local values in `.env` in the working directory. Keep that file private. Existing process values override `.env` values.

## Profiles

Run `cfhub auth login --profile work` to save an API token in the `work` profile. Run `cfhub auth list` to list profiles. Run `cfhub auth switch --profile work` to select one. Run `cfhub auth logout --profile work` to remove its access.

Set `CLOUDFLARE_PROFILE` to select a profile for one shell session. Without that value, cfhub uses the active saved profile.

Run `cfhub oauth login --profile work` to save OAuth access to a profile. Run `cfhub oauth status` to check OAuth access.

## Storage paths

By default, cfhub stores options under `~/.config/cfhub`. Set `CFHUB_CONFIG_DIR` to use a different folder. If `XDG_CONFIG_HOME` is set, cfhub uses `$XDG_CONFIG_HOME/cfhub`.

cfhub uses the operating system keychain when available. If no keychain is available, cfhub stores credentials in a private file. Do not share credential files or add them to source control.

## Other settings

Run `cfhub config list` to list options. Run `cfhub config get <key>` to read one option. Run `cfhub config set <key> <value>` to change one option. Run `cfhub config unset <key>` to remove one option.

Set `pager`, `color`, or `width` to control terminal output. Set `update-check` to `false` to stop the daily update check. You can also set `CFHUB_NO_UPDATE_CHECK=1`.

## OAuth client values

Set `CFHUB_OAUTH_CLIENT_ID` to use a client ID other than the built-in Eliware client. Set `CFHUB_OAUTH_SCOPES` to request a comma-separated scope list. See [OAuth access](oauth-scopes.md) for callback and scope details.
