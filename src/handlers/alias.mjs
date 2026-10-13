import { readAliases, writeAliases } from "../aliases.mjs";
import { printResourceHelp } from "../help/resources.mjs";

export function handleAlias({ args, opts, printer, homeDir, fsImpl }) {
  const stored = readAliases(homeDir, fsImpl);
  const action = args[1];
  const aliasName = args[2];
  if (action === "list")
    return opts.json || opts.output === "json"
      ? printer.log(JSON.stringify(stored, null, 2))
      : Object.entries(stored).forEach(([name, command]) => printer.log(`${name} ${command}`));
  if (action === "set") {
    if (!aliasName || !args[3]) return printer.error("Usage: cfhub alias set <name> <command>");
    stored[aliasName] = args.slice(3).join(" ");
    writeAliases(stored, homeDir, fsImpl);
    return printer.log(`Set alias ${aliasName}`);
  }
  if (action === "delete") {
    if (!aliasName || !stored[aliasName])
      return printer.error(`Unknown alias: ${aliasName || "(missing)"}`);
    delete stored[aliasName];
    writeAliases(stored, homeDir, fsImpl);
    return printer.log(`Deleted alias ${aliasName}`);
  }
  return printResourceHelp("alias", printer);
}
