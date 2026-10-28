# Command actions

This guide lists the actions for each command group. Run `cfhub <command> --help` for details. Run `cfhub <command> <action> --help` for action flags and examples.

## Core commands

| Command         | Actions                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `auth`          | `login`, `status`, `verify`, `list`, `switch`, `logout`                           |
| `oauth`         | `login`, `status`, `verify`, `list`, `switch`, `logout`                           |
| `zones`         | `list`, `get`, `audit`, `security`, `create`, `update`, `delete`                  |
| `dns-records`   | `list`, `get`, `create`, `update`, `delete`, `diff`, `apply`                      |
| `zone-settings` | `get`, `set`                                                                      |
| `rulesets`      | `list`, `get`, `create`, `update`                                                 |
| `lists`         | `list`, `get`, `create`, `update`, `delete`                                       |
| `list-items`    | `list`, `create`, `delete`                                                        |
| `ssl`           | `get`, `set`, `certificates`, `coverage`                                          |
| `cache`         | `purge`                                                                           |
| `api`           | Pass a relative Cloudflare API path. Set `--method` to select the request method. |

## Account commands

| Command         | Actions                                     |
| --------------- | ------------------------------------------- |
| `health`        | `list`, `get`, `create`, `delete`           |
| `audit`         | `list`                                      |
| `inventory`     | `export`                                    |
| `origin-ca`     | `list`, `create`, `revoke`                  |
| `load-balancer` | `list`, `get`, `create`, `update`, `delete` |
| `tunnel`        | `list`, `get`, `create`, `update`, `delete` |

## Platform commands

| Command     | Actions                                        |
| ----------- | ---------------------------------------------- |
| `workers`   | `list`, `get`, `create`, `update`, `delete`    |
| `pages`     | `list`, `get`, `create`, `update`, `delete`    |
| `r2`        | `list`, `get`, `create`, `update`, `delete`    |
| `d1`        | `list`, `get`, `create`, `update`, `delete`    |
| `queues`    | `list`, `get`, `create`, `update`, `delete`    |
| `stream`    | `list`, `get`, `create`, `update`, `delete`    |
| `images`    | `list`, `get`, `create`, `update`, `delete`    |
| `ai`        | `list`, `get`, `create`, `update`, `delete`    |
| `access`    | `list`, `get`, `create`, `update`, `delete`    |
| `extension` | `list`, `info`, `install`, `upgrade`, `remove` |
| `alias`     | `list`, `set`, `delete`                        |
| `config`    | `list`, `get`, `set`, `unset`                  |

## Common options

Pass `--zone-id` for zone commands. Pass `--account-id` for account commands. Pass `--id` when an action needs a resource ID.

Pass JSON with `--data` or load it from a file with `--file`. Read action help before you send a write request.

## Authentication login options

Save an API token with `auth login`. Pass `--profile <name>` to select a profile name. Pass `--account-id <id>` or `--zone-id <id>` to associate an account or zone. Pass `--token-stdin` to read the token from standard input.

Run `oauth login` to sign in through a browser. Pass `--profile <name>`, `--account-id <id>`, or `--zone-id <id>` to set profile details. Pass `--scopes <scopes>` for more comma-separated scopes. Pass `--scope <scope>` for one more scope. Pass `--no-scope-picker` to skip the browser scope picker.

Compare the current DNS records with a JSON file:

```sh
cfhub dns-records diff --zone-id <zone_id> --file dns-records.json
```

Inspect the diff before you apply it:

```sh
cfhub dns-records apply --zone-id <zone_id> --file dns-records.json --force
```

The `--force` flag confirms destructive actions. Use `--dry-run` when the action supports a preview.
