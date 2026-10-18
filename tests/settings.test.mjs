import { jest } from "@jest/globals";
import { readSettings, writeSettings } from "../src/settings.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../test-fixtures/unit/mock-node-fs.mjs";

test("settings persist and read through filesystem adapters", () => {
  const files = new Map();
  const adapter = {
    mkdirSync: () => {},
    writeFileSync: (name, value) => files.set(name, value),
    existsSync: (name) => files.has(name),
    readFileSync: (name) => files.get(name),
    chmodSync: jest.fn(),
  };
  writeSettings({ pager: "less" }, "/tmp/cf-settings", adapter);
  expect(files.size).toBe(1);
  expect(readSettings("/tmp/cf-settings", adapter)).toEqual({ pager: "less" });
  expect(adapter.chmodSync).toHaveBeenCalled();
  expect(readSettings("/tmp/cf-settings", { existsSync: () => false })).toEqual({});
  writeSettings({}, "/tmp/cf-settings-no-chmod", { mkdirSync: () => {}, writeFileSync: () => {} });
});

test("settings write and read through the memory filesystem", () => {
  const fsImpl = createMemoryFs();
  writeSettings({ pager: "less" }, "/tmp/cfhub-home/test", fsImpl);
  expect(readSettings("/tmp/cfhub-home/test", fsImpl)).toEqual({ pager: "less" });
});

test("malformed settings fall back to defaults", () => {
  const fsImpl = {
    existsSync: () => true,
    readFileSync: () => "{broken",
  };
  expect(readSettings("/tmp/cf-malformed-settings", fsImpl)).toEqual({});
});

test("settings reads rethrow filesystem errors", () => {
  const fsImpl = {
    existsSync: () => true,
    readFileSync: () => {
      throw new Error("read failed");
    },
  };
  expect(() => readSettings("/tmp/cf-settings-read-error", fsImpl)).toThrow("read failed");
});

test("settings helpers use the default filesystem adapter", async () => {
  await jest.resetModules();
  const fsImpl = mockNodeFs(jest);
  const { readSettings, writeSettings } = await import("../src/settings.mjs");
  expect(readSettings("/mock-home")).toEqual({});
  writeSettings({ pager: "less" }, "/mock-home");
  expect(fsImpl.existsSync).toHaveBeenCalled();
  expect(fsImpl.renameSync).toHaveBeenCalled();
});
