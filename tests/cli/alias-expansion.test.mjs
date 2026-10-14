import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expandCommandAlias } from "../../src/cli/alias-expansion.mjs";

test("expands aliases and merges caller options over alias options", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-alias-"));
  const config = path.join(homeDir, ".config", "cfhub");
  fs.mkdirSync(config, { recursive: true });
  fs.writeFileSync(path.join(config, "aliases.json"), JSON.stringify({ z: "zones list --json" }));
  expect(expandCommandAlias({ args: ["z"], opts: { quiet: true }, homeDir, fsImpl: fs })).toEqual({
    args: ["zones", "list"],
    opts: { json: true, quiet: true },
  });
});

test("keeps arguments and options when no alias matches", () => {
  const args = ["zones", "list"];
  const opts = { json: true };
  expect(expandCommandAlias({ args, opts, homeDir: os.tmpdir(), fsImpl: fs })).toEqual({
    args,
    opts,
  });
});

test("preserves spaces in caller arguments when an alias expands", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-alias-"));
  const config = path.join(homeDir, ".config", "cfhub");
  fs.mkdirSync(config, { recursive: true });
  fs.writeFileSync(path.join(config, "aliases.json"), JSON.stringify({ say: "zone get" }));
  expect(
    expandCommandAlias({ args: ["say", "two words"], opts: {}, homeDir, fsImpl: fs }).args,
  ).toEqual(["zone", "get", "two words"]);
});
