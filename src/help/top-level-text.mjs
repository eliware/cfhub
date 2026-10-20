import { COMMAND_GROUPS, GLOBAL_FLAGS } from "../cli/command/catalog.mjs";

const commandLines = COMMAND_GROUPS.flatMap(({ title, commands }) => [
  title,
  ...commands.map(([name, description]) => `  ${name}: ${description}`),
  "",
]);

export const TOP_LEVEL_HELP = [
  "Manage Cloudflare from the command line.",
  "",
  "USAGE",
  "  cfhub <command> <subcommand> [flags]",
  "",
  ...commandLines,
  "FLAGS",
  ...GLOBAL_FLAGS.map(([flag, description]) => `  ${flag} ${description}`),
  "",
  "EXAMPLES",
  "  $ cfhub zones list",
  "  $ cfhub dns-records list --zone-id <zone_id>",
  "  $ cfhub api /zones --json",
  "  $ cfhub auth login",
  "  $ cfhub oauth status",
  "  $ cfhub extension list",
  "",
  "LEARN MORE",
  "  Use 'cfhub <command> <subcommand> --help' for more information.",
  "  Use the resource names shown above.",
  "  When you require a personal shortcut, define it with 'cfhub alias set'.",
].join("\n");
