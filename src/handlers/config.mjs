import { readSettings, writeSettings } from "../settings.mjs";
import { printResourceHelp } from "../help.mjs";

export function handleConfigCommand({ args, opts, printer, homeDir, fsImpl }) {
  const settings = readSettings(homeDir, fsImpl);
  const action = args[1];
  const key = args[2];
  if (action === "list")
    return opts.json || opts.output === "json"
      ? printer.log(JSON.stringify(settings, null, 2))
      : Object.entries(settings).forEach(([name, value]) => printer.log(`${name} ${value}`));
  if (action === "get") return printer.log(settings[key] ?? "");
  if (action === "set") {
    if (!key || args[3] === undefined)
      return printer.error("Usage: cfhub config set <name> <value>");
    settings[key] = args.slice(3).join(" ");
    writeSettings(settings, homeDir, fsImpl);
    return printer.log(`Set config ${key}`);
  }
  if (action === "unset") {
    delete settings[key];
    writeSettings(settings, homeDir, fsImpl);
    return printer.log(`Unset config ${key}`);
  }
  return printResourceHelp("config", printer);
}
