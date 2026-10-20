import { COMMAND_GROUPS, GLOBAL_FLAGS } from "../command/catalog.mjs";

export function renderCommandReference() {
  const commandRows = COMMAND_GROUPS.flatMap(({ title, commands }) =>
    commands.map(
      ([name, description]) =>
        `| ${title.replace(" COMMANDS", "")} | \`${name}\` | ${description} |`,
    ),
  );
  const flagRows = GLOBAL_FLAGS.map(([name, description]) => `| \`${name}\` | ${description} |`);
  return [
    "# Command reference",
    "",
    "Run `cfhub --help` to list commands. Run `cfhub <command> --help` to list actions.",
    "Use action help to list flags.",
    "See [Command actions](command-actions.md) for the full action list.",
    "",
    "## Commands",
    "",
    "| Group | Command | Description |",
    "| --- | --- | --- |",
    ...commandRows,
    "",
    "## Global flags",
    "",
    "| Flag | Description |",
    "| --- | --- |",
    ...flagRows,
    "",
    "Supported color values are `always`, `never`, and `auto`.",
    "",
    "## API requests",
    "",
    "Pass a relative Cloudflare API path to `cfhub api`:",
    "",
    "```sh",
    "cfhub api /zones --json",
    "cfhub api /zones/<zone_id>/dns_records --json",
    "```",
    "",
    "The method defaults to GET. Set `--method` to GET, POST, PUT, PATCH, or DELETE.",
    "Pass a JSON request body with `--data` or `--file`.",
    "GET requests reject bodies, and DELETE requires `--force` or `--dry-run`.",
    "Pass `--paginate` to fetch all pages from supported GET requests.",
    "",
    "Shell completions use the command and flag names in this reference.",
    "",
  ].join("\n");
}
