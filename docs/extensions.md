# Local extensions

An extension adds local commands to cfhub. cfhub loads extensions from `~/.config/cfhub/extensions/<name>`.

## Manifest

Each extension folder must contain `cf-extension.json`. The manifest names the extension and maps command names to module files:

```json
{
  "name": "hello",
  "version": "1.0.0",
  "commands": {
    "hello": "hello.mjs"
  }
}
```

The command module must export a default function, `run` function, or `handler` function. cfhub passes command options and output helpers to that function.

## Install the example

```sh
cfhub extension install --path examples/extensions/hello
cfhub extension list
cfhub extension info --name hello
```

Run the installed command by its name. Use command help to see its options.

## Update or remove an extension

Run `cfhub extension upgrade --path <folder>` to copy a new extension version. Run `cfhub extension remove --name <name> --force` to remove an extension.

Install extensions only from sources that you trust. An extension runs as your user and can access files and credentials that your account can access.
