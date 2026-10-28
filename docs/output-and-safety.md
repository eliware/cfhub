# Output and safe writes

cfhub prints readable text by default. Add `--json` or `--output json` to print JSON for scripts. cfhub returns exit code 0 after success and 1 after a command or API error.

## JSON output

Add `--json` or `--output json` to print JSON. Use `--jq` to select JSON fields:

```sh
cfhub zones list --json --jq '.result[].name'
```

Use `--template` to format JSON data with field placeholders:

```sh
cfhub api /zones --json --template '{{.result}}'
```

JSON output does not use a pager or color. Check a command's help for supported filters and output fields. Use `--output text` to override `--json`.

## Terminal output

Select `always`, `never`, or `auto` for the `color` option. Pass `--color` to select a mode for one command.

Set the `pager` option to a command or to `never`. Pass `--no-pager` to disable paging for one command.

Set `width` to a number of columns. Pass `--width` to override this option. Add `--quiet` to suppress standard output. Add `--verbose` to include diagnostic details.

## Preview writes

Add `--dry-run` to preview a supported write. A preview does not apply the change. Check the output before you run the command without `--dry-run`.

## Confirm destructive actions

Add `--force` to confirm a destructive action. Commands refuse supported destructive actions without this flag. Inspect the target and request before you confirm. The flag does not grant missing Cloudflare permissions.

## Use the API command

`cfhub api` accepts relative Cloudflare API paths. It uses `GET` by default. Set `--method` to `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`.

Read requests do not accept a body. Pass a JSON body with `--data` or `--file`. `DELETE` requires `--force` or a true `--dry-run` value. `--dry-run=false` does not authorize deletion. Pass `--paginate` to fetch all pages from supported GET requests.

## Keep access private

Keep tokens and OAuth credentials private. Do not store secrets in shell history. Use `--token-stdin` to pass a token through standard input in automation.
