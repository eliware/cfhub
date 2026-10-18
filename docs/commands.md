# Command reference

Run `cfhub --help` to list commands. Run `cfhub <resource> --help` to list actions. Use command help for flags.

## Cloudflare resources

| Command                                                           | Common actions                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| `zones`                                                           | `list`, `get`, `audit`, `security`, `create`, `update`, `delete` |
| `dns-records`                                                     | `list`, `get`, `create`, `update`, `delete`, `diff`, `apply`     |
| `zone-settings`                                                   | `get`, `set`                                                     |
| `rulesets`                                                        | `list`, `get`, `create`, `update`                                |
| `lists`                                                           | `list`, `get`, `create`, `update`, `delete`                      |
| `list-items`                                                      | `list`, `create`, `delete`                                       |
| `ssl`                                                             | `get`, `set`, `certificates`, `coverage`                         |
| `origin-ca`                                                       | `list`, `create`, `revoke`                                       |
| `load-balancer`                                                   | `list`, `get`, `create`, `update`, `delete`                      |
| `tunnel`                                                          | Resource actions. Run command help for details.                  |
| `workers`                                                         | `list`, `get`, `create`, `update`, `delete`                      |
| `pages`, `r2`, `d1`, `queues`, `stream`, `images`, `ai`, `access` | Resource actions. Run command help for details.                  |

## Local commands

| Command     | Use                                |
| ----------- | ---------------------------------- |
| `auth`      | Add and manage API token profiles. |
| `oauth`     | Add and manage OAuth profiles.     |
| `api`       | Call a Cloudflare API path.        |
| `audit`     | Inspect recent resource changes.   |
| `inventory` | Export account inventory.          |
| `extension` | Manage local command extensions.   |
| `alias`     | Manage command aliases.            |
| `config`    | Read and change cfhub options.     |

## API calls

Pass a relative Cloudflare API path to `cfhub api`:

```sh
cfhub api /zones --json
cfhub api /zones/<zone_id>/dns_records --json
```

Use `--data` to pass a JSON body. Use `--file` to read a request body from a file. The API command supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. Run `cfhub api --help` for method options.

## Common flags

| Flag                     | Use                                        |
| ------------------------ | ------------------------------------------ |
| `--json`                 | Print JSON output.                         |
| `--output json\|text`    | Select output format.                      |
| `--jq <filter>`          | Select values from JSON output.            |
| `--template <text>`      | Format output with a template.             |
| `--account-id <id>`      | Set the account ID used by this command.   |
| `--zone-id <id>`         | Set the zone for a command.                |
| `--dry-run`              | Preview a supported write.                 |
| `--force`                | Confirm a destructive action.              |
| `--paginate`             | Request all result pages when supported.   |
| `--color <mode>`         | Set color to `always`, `never`, or `auto`. |
| `--pager` / `--no-pager` | Enable or disable the pager.               |

Use `--help` for all global flags and action options.
