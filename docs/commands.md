# Command reference

Run `cfhub --help` to list commands. Run `cfhub <command> --help` to list actions.
Use action help to list flags.
See [Command actions](command-actions.md) for the full action list.

## Commands

| Group    | Command         | Description                                   |
| -------- | --------------- | --------------------------------------------- |
| CORE     | `auth`          | Save and manage API-token profiles.           |
| CORE     | `oauth`         | Manage OAuth browser authentication.          |
| CORE     | `zones`         | Manage zones.                                 |
| CORE     | `dns-records`   | Manage DNS records.                           |
| CORE     | `zone-settings` | Manage zone options.                          |
| CORE     | `rulesets`      | Manage rulesets.                              |
| CORE     | `lists`         | Manage account lists.                         |
| CORE     | `list-items`    | Manage account list items.                    |
| CORE     | `ssl`           | Inspect and configure SSL/TLS.                |
| CORE     | `cache`         | Manage cache settings.                        |
| CORE     | `api`           | Make an authenticated Cloudflare API request. |
| ACCOUNT  | `health`        | Check Cloudflare API access.                  |
| ACCOUNT  | `audit`         | View account audit logs.                      |
| ACCOUNT  | `inventory`     | Export account inventory.                     |
| ACCOUNT  | `origin-ca`     | Manage CA certificates.                       |
| ACCOUNT  | `load-balancer` | Manage zone load balancers.                   |
| ACCOUNT  | `tunnel`        | Manage account tunnels.                       |
| PLATFORM | `workers`       | Manage Workers.                               |
| PLATFORM | `pages`         | Manage Pages projects.                        |
| PLATFORM | `r2`            | Manage R2 buckets.                            |
| PLATFORM | `d1`            | Manage D1 databases.                          |
| PLATFORM | `queues`        | Manage Queues.                                |
| PLATFORM | `stream`        | Manage Stream.                                |
| PLATFORM | `images`        | Manage Images.                                |
| PLATFORM | `ai`            | Manage AI and Vectorize.                      |
| PLATFORM | `access`        | Manage Access and Zero Trust.                 |
| PLATFORM | `extension`     | Manage local cfhub extensions.                |
| PLATFORM | `alias`         | Manage command aliases.                       |
| PLATFORM | `config`        | Manage local cfhub options.                   |

## Global flags

| Flag           | Description                                      |
| -------------- | ------------------------------------------------ |
| `--help`       | Show help for a command.                         |
| `--version`    | Show the version.                                |
| `--json`       | Print JSON output.                               |
| `--output`     | Select json or text output.                      |
| `--jq`         | Select fields from JSON output.                  |
| `--template`   | Format JSON values with {{.field}} placeholders. |
| `--method`     | Set the API method for cfhub api.                |
| `--quiet`      | Suppress standard output.                        |
| `--pager`      | Page readable output.                            |
| `--no-pager`   | Disable paging.                                  |
| `--color`      | Set a color mode.                                |
| `--width`      | Set terminal width.                              |
| `--verbose`    | Include diagnostic details.                      |
| `--paginate`   | Fetch all supported pages.                       |
| `--web`        | Print a Cloudflare dashboard link.               |
| `--force`      | Confirm destructive actions.                     |
| `--dry-run`    | Show changes without writing.                    |
| `--account-id` | Cloudflare account ID.                           |
| `--zone-id`    | Cloudflare zone ID.                              |
| `--file`       | Read a JSON request body.                        |
| `--data`       | Use an inline JSON request body.                 |

Supported color values are `always`, `never`, and `auto`.

## API requests

Pass a relative Cloudflare API path to `cfhub api`:

```sh
cfhub api /zones --json
cfhub api /zones/<zone_id>/dns_records --json
```

The method defaults to GET. Set `--method` to GET, POST, PUT, PATCH, or DELETE.
Pass a JSON request body with `--data` or `--file`.
GET requests reject bodies, and DELETE requires `--force` or `--dry-run`.
Pass `--paginate` to fetch all pages from supported GET requests.

Shell completions use the command and flag names in this reference.
