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
    "Use `--data` for a JSON body. Use `--file` to read a body from a file.",
    "The API command supports GET, POST, PUT, PATCH, and DELETE.",
    "",
    "Shell completions use the command and flag names in this reference.",
    "",
  ].join("\n");
}
