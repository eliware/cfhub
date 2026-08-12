# `cfhub` extensions

Extensions are local packages installed below `~/.config/cfhub/extensions/<name>`.
Each package contains a `cfhub-extension.json` manifest:

```json
{
  "name": "hello",
  "version": "1.0.0",
  "commands": { "hello": "hello.mjs" }
}
```

The referenced module exports a default function (or `run`/`handler`) that
receives the normal command context: `cfhub`, `action`, `opts`, `body`, output
helpers, printer, and failure handling.

Install and use the example:

```sh
cfhub extension install --path examples/extensions/hello
cfhub hello --name Eli
cfhub extension list
cfhub extension info --name hello
cfhub extension upgrade --path examples/extensions/hello
cfhub extension remove --name hello --force
```

Extensions are intentionally separate from the core resource list. Kubernetes,
GitOps, VyOS, and certificate deployment integrations should be shipped as
separate extensions when those projects are ready.
