# Output and safe writes

cfhub prints text for users and JSON for scripts. It returns exit code 0 after success and 1 after a command or API error.

## JSON output

Add `--json` to print JSON. Use `--jq` to select fields:

```sh
cfhub zones list --json --jq '.result[].name'
```

Use `--template` to format JSON data:

```sh
cfhub api /zones --json --template '{{.result}}'
```

JSON output does not use a pager or color. Check a command's help for supported filters and output fields.

## Preview writes

Add `--dry-run` to preview a supported write. Check the output before you run the command without `--dry-run`.

## Confirm destructive actions

Add `--force` to confirm a destructive action. Commands refuse supported destructive actions without this flag. Inspect the target and request before you confirm.

## Use the API command

`cfhub api` accepts Cloudflare API paths. It supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. It supports request bodies with `--data` or `--file`. `DELETE` requires explicit confirmation. Use `--dry-run` to preview supported writes.

## Keep access private

Keep tokens and OAuth credentials private. Do not store secrets in shell history. Use `--token-stdin` to pass a token through standard input in automation.
