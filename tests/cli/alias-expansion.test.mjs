import { expandCommandAlias } from "../../src/cli/alias-expansion.mjs";
import { createMemoryFs } from "../../test-fixtures/unit/memory-fs.mjs";

test("expands aliases and merges caller options over alias options", () => {
  const homeDir = "/tmp/cfhub-home/alias-expansion";
  const fsImpl = createMemoryFs({
    [`${homeDir}/.config/cfhub/aliases.json`]: JSON.stringify({ z: "zones list --json" }),
  });
  expect(expandCommandAlias({ args: ["z"], opts: { quiet: true }, homeDir, fsImpl })).toEqual({
    args: ["zones", "list"],
    opts: { json: true, quiet: true },
  });
});

test("keeps arguments and options when no alias matches", () => {
  const args = ["zones", "list"];
  const opts = { json: true };
  expect(
    expandCommandAlias({ args, opts, homeDir: "/tmp/cfhub-home/empty", fsImpl: createMemoryFs() }),
  ).toEqual({
    args,
    opts,
  });
});

test("preserves spaces in caller arguments when an alias expands", () => {
  const homeDir = "/tmp/cfhub-home/alias-spaces";
  const fsImpl = createMemoryFs({
    [`${homeDir}/.config/cfhub/aliases.json`]: JSON.stringify({ say: "zone get" }),
  });
  expect(
    expandCommandAlias({ args: ["say", "two words"], opts: {}, homeDir, fsImpl }).args,
  ).toEqual(["zone", "get", "two words"]);
});
