import {
  COMMAND_GROUPS,
  COMMAND_NAMES,
  GLOBAL_FLAG_NAMES,
} from "../../../src/cli/command/catalog.mjs";
import { TOP_LEVEL_HELP } from "../../../src/help/top-level-text.mjs";

test("catalog contains unique commands that appear in top-level help", () => {
  expect(new Set(COMMAND_NAMES).size).toBe(COMMAND_NAMES.length);
  for (const command of COMMAND_NAMES) expect(TOP_LEVEL_HELP).toContain(`  ${command}:`);
});

test("each command group has a name and each global flag has a description", () => {
  expect(COMMAND_GROUPS.every(({ title, commands }) => title && commands.length)).toBe(true);
  for (const flag of GLOBAL_FLAG_NAMES) expect(TOP_LEVEL_HELP).toContain(`  ${flag} `);
});
