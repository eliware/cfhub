import { commandNamesFor, suggestCommand } from "../suggestions.mjs";

export function validateCommandAction({ resource, action, printer, exit }) {
  if (
    resource === "api" ||
    !action ||
    !commandNamesFor(resource).length ||
    commandNamesFor(resource).includes(action)
  )
    return null;
  const suggestion = suggestCommand(resource, action);
  printer.error(
    `unknown command "${action}" for "cfhub ${resource}"${suggestion ? `\n\nDid you mean this?\n\t${suggestion}` : ""}\n\nUsage: cfhub ${resource} <command> [flags]`,
  );
  return { done: true, value: exit(1) };
}
