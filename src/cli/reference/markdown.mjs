import { COMMAND_GROUPS, GLOBAL_FLAGS } from "../command/catalog.mjs";

function renderTable(headers, rows) {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );
  const renderRow = (row) =>
    `| ${row.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`;
  return [
    renderRow(headers),
    renderRow(widths.map((width) => "-".repeat(width))),
    ...rows.map(renderRow),
  ];
}

export function renderCommandReference() {
  const commandRows = COMMAND_GROUPS.flatMap(({ title, commands }) =>
    commands.map(([name, description]) => [
      title.replace(" COMMANDS", ""),
      `\`${name}\``,
      description,
    ]),
  );
  const flagRows = GLOBAL_FLAGS.map(([name, description]) => [`\`${name}\``, description]);
  return [
    "# Command reference",
    "",
    "Run `cfhub --help` to list commands. Run `cfhub <command> --help` to list actions.",
    "Run `cfhub <command> <action> --help` to show purpose, syntax, required values, options, and defaults.",
    "See [Command actions](command-actions.md) for the full action list.",
    "",
    "## Commands",
    "",
    ...renderTable(["Group", "Command", "Description"], commandRows),
    "",
    "## Global flags",
    "",
    ...renderTable(["Flag", "Description"], flagRows),
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
    "## List items",
    "",
    "Use `--per-page` to set the item count for each page from 1 to 500 for `list-items list`.",
    "The default page contains 100 items when you pass `--paginate`.",
    "Pass `--paginate` to read every list item. The command follows each cursor that Cloudflare returns.",
    "A cursor is a token that identifies a later page.",
    "",
    "```sh",
    "cfhub list-items list --account-id <account_id> --id <list_id> --per-page 500 --paginate --json",
    "```",
    "",
    "Shell completions use the command and flag names in this reference.",
    "",
  ].join("\n");
}
