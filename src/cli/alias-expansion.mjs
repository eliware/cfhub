import { parseArgs } from "../args.mjs";
import { tokenizeCommand } from "../alias-tokenizer.mjs";
import { readAliases } from "../aliases.mjs";

export function expandCommandAlias({ args, opts, homeDir, fsImpl }) {
  const [resource] = args;
  const expansion = readAliases(homeDir, fsImpl)[resource];
  if (!expansion) return { args, opts };
  const expanded = parseArgs([...tokenizeCommand(expansion), ...args.slice(1)]);
  return { args: expanded.args, opts: { ...expanded.opts, ...opts } };
}
