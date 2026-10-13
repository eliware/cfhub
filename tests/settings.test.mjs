import { jest } from "@jest/globals";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readSettings, writeSettings } from "../src/settings.mjs";

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

test("settings use the default filesystem adapter", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cfhub-settings-"));
  try {
    writeSettings({ pager: "less" }, home);
    expect(readSettings(home)).toEqual({ pager: "less" });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
