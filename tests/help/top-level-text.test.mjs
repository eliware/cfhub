import { TOP_LEVEL_HELP } from "../../src/help/top-level-text.mjs";

test("top-level help lists core commands and common flags", () => {
  expect(TOP_LEVEL_HELP).toContain("CORE COMMANDS");
  expect(TOP_LEVEL_HELP).toContain("--dry-run");
  expect(TOP_LEVEL_HELP).toContain("cfhub oauth status");
});
