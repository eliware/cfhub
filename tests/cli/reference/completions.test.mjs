import { COMMAND_NAMES, GLOBAL_FLAG_NAMES } from "../../../src/cli/command/catalog.mjs";
import { renderShellCompletions } from "../../../src/cli/reference/completions.mjs";

test("shell completions use every catalog command and global flag", () => {
  const completions = renderShellCompletions();
  for (const [path, content] of Object.entries(completions)) {
    for (const command of COMMAND_NAMES) expect(content).toContain(command);
    for (const flag of GLOBAL_FLAG_NAMES) {
      const reference = path.endsWith(".fish") ? `-l ${flag.slice(2)}` : flag;
      expect(content).toContain(reference);
    }
  }
});

test("shell completion renderer returns all supported shell files", () => {
  expect(Object.keys(renderShellCompletions())).toEqual([
    "completions/cfhub.bash",
    "completions/cfhub.fish",
    "completions/cfhub.ps1",
    "completions/_cfhub",
  ]);
});
