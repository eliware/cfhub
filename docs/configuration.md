# Profiles and settings

cfhub reads access values from environment variables and saved profiles. Environment values override saved profile values.

## Environment values

Use this table to set environment values:

| Name                          | Default                                                                         | Required status                                                      | Purpose                                                   |
| ----------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`        | No token                                                                        | Required when no saved profile supplies access.                      | Use an API token for this process.                        |
| `CLOUDFLARE_ACCOUNT_ID`       | Unset                                                                           | Required for account actions when no flag or profile provides an ID. | Set the default account ID.                               |
| `CLOUDFLARE_ZONE_ID`          | Unset                                                                           | Required for zone actions when no flag or profile provides an ID.    | Set the default zone ID.                                  |
| `CLOUDFLARE_PROFILE`          | The active saved profile                                                        | No.                                                                  | Select a profile for this process.                        |
| `CFHUB_CONFIG_DIR`            | `$XDG_CONFIG_HOME/cfhub`, or `~/.config/cfhub`                                  | No.                                                                  | Set the configuration folder.                             |
| `XDG_CONFIG_HOME`             | Unset                                                                           | No.                                                                  | Set the parent folder for the default configuration path. |
| `CFHUB_NO_UPDATE_CHECK`       | Unset. Daily checks are enabled.                                                | No.                                                                  | Set `1` to disable update checks.                         |
| `CFHUB_OAUTH_CLIENT_ID`       | The built-in Eliware client                                                     | No.                                                                  | Set an OAuth client ID.                                   |
| `CFHUB_OAUTH_SCOPES`          | No configured scopes                                                            | No.                                                                  | Preselect comma-separated scopes in the picker.           |
| `CFHUB_OAUTH_BIND_HOST`       | `127.0.0.1`                                                                     | No.                                                                  | Set the local callback listener address.                  |
| `CFHUB_OAUTH_REDIRECT_HOST`   | `127.0.0.1`                                                                     | No.                                                                  | Set the host in the OAuth callback URL.                   |
| `CFHUB_API_PERMISSIONS`       | Values from the active profile                                                  | No.                                                                  | List permissions known for the active token.              |
| `CFHUB_API_PERMISSIONS_KNOWN` | Unset                                                                           | No.                                                                  | Set `1` when the permission list is complete.             |
| `PAGER`                       | Pager is off. `--pager` uses the configured command, then `PAGER`, then `less`. | No.                                                                  | Select the pager command.                                 |
| `NO_COLOR`                    | Unset                                                                           | No.                                                                  | Disable automatic color when this value is nonempty.      |

cfhub uses `CLOUDFLARE_API_TOKEN` when you do not save access in a profile. Use the account and zone values only when a command needs those IDs.

The active profile supplies permission values when it records a complete permission list. cfhub checks known permissions before API calls. It rejects a command when the token lacks a required permission. Do not set `CFHUB_API_PERMISSIONS` values manually unless you know the full list.

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

| Option         | Default     | Purpose                         | Values                        |
| -------------- | ----------- | ------------------------------- | ----------------------------- |
| `pager`        | Off         | Set the pager command.          | A command name, or `never`.   |
| `color`        | `auto`      | Set terminal color.             | `always`, `never`, or `auto`. |
| `width`        | 120 columns | Set the output width.           | A number of columns.          |
| `update-check` | `true`      | Control the daily update check. | `true` or `false`.            |

Set `CFHUB_NO_UPDATE_CHECK=1` to disable the update check for one process.

## OAuth values

Set `CFHUB_OAUTH_CLIENT_ID` to use a client ID other than the built-in Eliware client. Set `CFHUB_OAUTH_SCOPES` to preselect more scopes in the picker. Set `CFHUB_OAUTH_BIND_HOST` to change the local listener address. Set `CFHUB_OAUTH_REDIRECT_HOST` to change the callback host. See [OAuth access](oauth-scopes.md) for scope details.
