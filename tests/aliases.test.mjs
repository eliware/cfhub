import { jest } from "@jest/globals";
import { readAliases, writeAliases } from "../src/aliases.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../test-fixtures/unit/mock-node-fs.mjs";

test("aliases and settings persist with private files", () => {
  const home = "/tmp/cfhub-home/test";
  const fsImpl = createMemoryFs();
  writeAliases({ zones: "zone list" }, home, fsImpl);
  expect(readAliases(home, fsImpl)).toEqual({ zones: "zone list" });
  expect(fsImpl.chmodCalls.at(-1)).toEqual([`${home}/.config/cfhub/aliases.json`, 0o600]);
  expect(readAliases(home, {})).toEqual({});
});

test("aliases and settings tolerate adapters without filesystem methods", () => {
  const files = new Map();
  const adapter = { mkdirSync: () => {}, writeFileSync: (name, value) => files.set(name, value) };
  writeAliases({}, "/tmp/cf-no-chmod", adapter);
  expect(files.size).toBe(1);
  expect(readAliases("/tmp/cf-no-chmod", { existsSync: () => false })).toEqual({});
});

test("malformed aliases do not stop command resolution", () => {
  const fsImpl = {
    existsSync: () => true,
    readFileSync: () => "{broken",
  };
  expect(readAliases("/tmp/cf-malformed-aliases", fsImpl)).toEqual({});
});

test("alias reads rethrow filesystem errors", () => {
  const fsImpl = {
    existsSync: () => true,
    readFileSync: () => {
      throw new Error("read failed");
    },
  };
  expect(() => readAliases("/tmp/cf-alias-read-error", fsImpl)).toThrow("read failed");
});

test("alias helpers use the default filesystem adapter", async () => {
  await jest.resetModules();
  const fsImpl = mockNodeFs(jest);
  const { readAliases, writeAliases } = await import("../src/aliases.mjs");
  expect(readAliases("/mock-home")).toEqual({});
  writeAliases({ shortcut: "zones list" }, "/mock-home");
  expect(fsImpl.existsSync).toHaveBeenCalled();
  expect(fsImpl.renameSync).toHaveBeenCalled();
});
