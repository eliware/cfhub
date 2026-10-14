import { resourceNames, suggestCommand } from "../suggestions.mjs";

export function validateCommandResource({ resource, extensionManifest, printer, exit }) {
  if (extensionManifest || resourceNames.includes(resource)) return null;
  const suggestion = suggestCommand("resource", resource);
  printer.error(
    `unknown command "${resource}" for "cfhub"${suggestion ? `\n\nDid you mean this?\n\t${suggestion}` : ""}\n\nUsage: cfhub <command> <subcommand> [flags]`,
  );
  return { done: true, value: exit(1) };
}
