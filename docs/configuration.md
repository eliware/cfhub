# Profiles and settings

cfhub reads access values from environment variables and saved profiles. Environment values override saved profile values.

## Environment values

Set these values when a command needs them:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
CLOUDFLARE_PROFILE
```

Set `CLOUDFLARE_API_TOKEN` to use a token without saving it to a profile. Set `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_ZONE_ID` to provide default IDs.

Set `CLOUDFLARE_PROFILE` to select a saved profile for one process. A process value overrides the active profile name.

cfhub reads `~/.cfhub` before the project `.env` file. It does not replace values in the process environment. It keeps values from `~/.cfhub` when the project file has the same key.

## Profiles

Run `cfhub auth login --profile work` to save an API token in the `work` profile. The command selects the profile after login. Run `cfhub auth list` to list profiles. Run `cfhub auth switch --profile work` to select one. Run `cfhub auth logout --profile work` to remove its access.

Set `CLOUDFLARE_PROFILE` to select a profile for one shell session. Without that value, cfhub uses the active saved profile.

Run `cfhub oauth login --profile work` to save OAuth access to a profile. Run `cfhub oauth status` to check OAuth access.

## Storage paths

By default, cfhub stores settings and profiles under `~/.config/cfhub`. Set `CFHUB_CONFIG_DIR` to use a different folder. If that variable is unset, cfhub uses `$XDG_CONFIG_HOME/cfhub` when `XDG_CONFIG_HOME` is set.

cfhub uses the operating system keychain when available. If no keychain is available, cfhub stores credentials in `credentials.json` under the configuration folder. Keep this file private. Do not add it to source control.

## Other settings

Run `cfhub config list` to list options. Run `cfhub config get <key>` to read one option. Run `cfhub config set <key> <value>` to change one option. Run `cfhub config unset <key>` to remove one option.

| Option         | Purpose                         | Values                        |
| -------------- | ------------------------------- | ----------------------------- |
| `pager`        | Set the pager command.          | A command name, or `never`.   |
| `color`        | Set terminal color.             | `always`, `never`, or `auto`. |
| `width`        | Set the output width.           | A number of columns.          |
| `update-check` | Control the daily update check. | `true` or `false`.            |

Set `CFHUB_NO_UPDATE_CHECK=1` to disable the update check for one process.

## OAuth values

Set `CFHUB_OAUTH_CLIENT_ID` to use a client ID other than the built-in Eliware client. Set `CFHUB_OAUTH_SCOPES` to preselect more scopes in the picker. Set `CFHUB_OAUTH_BIND_HOST` to change the local listener address. Set `CFHUB_OAUTH_REDIRECT_HOST` to change the callback host. See [OAuth access](oauth-scopes.md) for scope details.
