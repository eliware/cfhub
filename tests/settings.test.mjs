import { readSettings, writeSettings } from "../src/settings.mjs";

test("settings persist and read through filesystem adapters", () => {
  const files = new Map();
  const adapter = { mkdirSync: () => {}, writeFileSync: (name, value) => files.set(name, value) };
  writeSettings({ pager: "less" }, "/tmp/cf-settings", adapter);
  expect(files.size).toBe(1);
  expect(readSettings("/tmp/cf-settings", { existsSync: () => false })).toEqual({});
});
