# Setup and first use

cfhub is a command line tool for Cloudflare. It runs on Node.js 26 or later.

## Install

Install the package from npm:

```sh
npm install --global @eliware/cfhub
```

Check the install:

```sh
cfhub --version
cfhub --help
```

## Add access

Use an API token for direct setup:

```sh
cfhub auth login
```

Follow the prompts. Give the token only the Cloudflare permissions that your commands need. Use `cfhub oauth login` for OAuth access.

## Run commands

List zones:

```sh
cfhub zones list
```

List DNS records for a zone:

```sh
cfhub dns-records list --zone-id <zone_id>
```

Preview a write before you apply it:

```sh
cfhub dns-records create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"192.0.2.1"}' --dry-run
```

Use `cfhub auth status` to check access. Use `cfhub auth verify` to test the saved token.

## Get help

Run `cfhub --help` to list command groups. Run `cfhub <resource> --help` for actions. Run `cfhub <resource> <action> --help` for action options.

See [Profiles and settings](configuration.md) for access values. See [Output and safe writes](output-and-safety.md) before you change Cloudflare data.
