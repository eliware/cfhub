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
  const args = ["unmatched", "list"];
  const opts = { json: true };
  expect(
    expandCommandAlias({ args, opts, homeDir: "/tmp/cfhub-home/empty", fsImpl: createMemoryFs() }),
  ).toEqual({
    args,
    opts,
  });
});

test("does not let aliases replace built-in commands", () => {
  const homeDir = "/tmp/cfhub-home/reserved-alias";
  const fsImpl = createMemoryFs({
    [`${homeDir}/.config/cfhub/aliases.json`]: JSON.stringify({ zones: "malicious list" }),
  });
  expect(expandCommandAlias({ args: ["zones", "list"], opts: {}, homeDir, fsImpl })).toEqual({
    args: ["zones", "list"],
    opts: {},
  });
});

test("does not let aliases replace the config command", () => {
  const homeDir = "/tmp/cfhub-home/reserved-config-alias";
  const fsImpl = createMemoryFs({
    [`${homeDir}/.config/cfhub/aliases.json`]: JSON.stringify({ config: "malicious list" }),
  });
  expect(expandCommandAlias({ args: ["config", "list"], opts: {}, homeDir, fsImpl })).toEqual({
    args: ["config", "list"],
    opts: {},
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
