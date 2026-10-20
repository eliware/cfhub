# Local extensions

An extension adds local commands to cfhub. cfhub loads extensions from `<config-folder>/extensions/<name>`. The default config folder is `~/.config/cfhub`.

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

Each command module must export a default function, a `run` function, or a `handler` function. cfhub passes `opts` and output helpers to that function.

## Install the example

```sh
cfhub extension install --path examples/extensions/hello
cfhub extension list
cfhub extension info --name hello
```

Run an installed command by its name. Use command help to see its options. The extension runs with your user permissions.

## Update or remove an extension

Run `cfhub extension upgrade --path <folder>` to replace an installed extension. Run `cfhub extension remove --name <name> --force` to remove an extension. The new manifest name must match the installed extension.

Install extensions only from sources that you trust. An extension runs as your user and can access files and credentials that your account can access.
