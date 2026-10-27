import { normalizeOptionValue, readOptionValue } from "./args/option-value.mjs";

export function parseArgs(argv) {
  const args = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      args.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    if (eq !== -1) {
      const key = arg.slice(2, eq);
      const value = arg.slice(eq + 1);
      opts[key] = normalizeOptionValue(key, value);
      continue;
    }
    const key = arg.slice(2);
    const option = readOptionValue(argv[i + 1]);
    opts[key] = option.consumesNext ? normalizeOptionValue(key, option.value) : option.value;
    if (option.consumesNext) i++;
  }
  return { args, opts };
}
