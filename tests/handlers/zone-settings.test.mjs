import { jest } from "@jest/globals";
import { handleZoneSettings } from "../../src/handlers/zone-settings.mjs";

test("handleZoneSettings is exported", () => {
  expect(typeof handleZoneSettings).toBe("function");
});
let fail;
let toJsonOutput;
let log;
beforeEach(() => {
  fail = jest.fn((msg) => {
    throw new Error(msg);
  });
  toJsonOutput = jest.fn();
  log = jest.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => log.mockRestore());
test("handleZoneSettings get/set/unknown", async () => {
  const cf = {
    zones: {
      settings: {
        get: jest.fn().mockResolvedValue({ value: "on" }),
        update: jest.fn().mockResolvedValue({ value: "off" }),
      },
    },
  };
  await handleZoneSettings({
    cf,
    action: "get",
    opts: { "zone-id": "z1", setting: "dev" },
    outputJson: true,
    toJsonOutput,
    fail,
  });
  await handleZoneSettings({
    cf,
    action: "set",
    opts: { "zone-id": "z1", setting: "dev" },
    body: { value: "off" },
    outputJson: false,
    toJsonOutput,
    fail,
  });
  await expect(
    handleZoneSettings({
      cf,
      action: "noop",
      opts: { "zone-id": "z1", setting: "dev" },
      outputJson: false,
      toJsonOutput,
      fail,
    }),
  ).rejects.toThrow("Unknown zone-settings action: noop");
  expect(cf.zones.settings.get).toHaveBeenCalledWith("z1", "dev");
  expect(cf.zones.settings.update).toHaveBeenCalledWith("z1", "dev", { value: "off" });
});

test("handleZoneSettings validates missing zone, setting, and value", async () => {
  const cf = { zones: { settings: { get: jest.fn(), update: jest.fn() } } };
  await expect(
    handleZoneSettings({
      cf,
      action: "get",
      opts: { setting: "dev" },
      outputJson: false,
      toJsonOutput,
      fail,
    }),
  ).rejects.toThrow("Missing --zone-id");
  await expect(
    handleZoneSettings({
      cf,
      action: "get",
      opts: { "zone-id": "z1" },
      outputJson: false,
      toJsonOutput,
      fail,
    }),
  ).rejects.toThrow("Missing --setting");
  await expect(
    handleZoneSettings({
      cf,
      action: "set",
      opts: { "zone-id": "z1", setting: "dev" },
      body: {},
      outputJson: false,
      toJsonOutput,
      fail,
    }),
  ).rejects.toThrow("Missing JSON body with value");
});

test("handleZoneSettings covers API variants, dry-run, and text output", async () => {
  const printer = { log: jest.fn() };
  const toJsonOutput = jest.fn();
  const fail = jest.fn((msg) => {
    throw new Error(msg);
  });
  const modern = {
    zones: {
      settings: {
        get: jest.fn().mockResolvedValue({ value: "on" }),
        edit: jest.fn().mockResolvedValue({ value: "off" }),
      },
    },
  };
  await handleZoneSettings({
    cf: modern,
    action: "get",
    opts: { "zone-id": "z", setting: "dev" },
    outputJson: false,
    printer,
    toJsonOutput,
    fail,
  });
  await handleZoneSettings({
    cf: modern,
    action: "get",
    opts: { "zone-id": "z", setting: "dev" },
    outputJson: true,
    printer,
    toJsonOutput,
    fail,
  });
  await handleZoneSettings({
    cf: modern,
    action: "set",
    opts: { "zone-id": "z", setting: "dev", "dry-run": true },
    body: { value: "on" },
    outputJson: false,
    printer,
    toJsonOutput,
    fail,
  });
  await handleZoneSettings({
    cf: modern,
    action: "set",
    opts: { "zone-id": "z", setting: "dev" },
    body: { value: "off" },
    outputJson: false,
    printer,
    toJsonOutput,
    fail,
  });
  const legacyGet = function legacyGet(setting, options) {
    return Promise.resolve({ value: setting, zone: options.zone_id });
  };
  const legacy = {
    zones: {
      settings: { get: legacyGet, update: jest.fn().mockResolvedValue({ value: "off" }) },
    },
  };
  await handleZoneSettings({
    cf: legacy,
    action: "get",
    opts: { "zone-id": "z", setting: "dev" },
    outputJson: false,
    printer,
    toJsonOutput,
    fail,
  });
  await handleZoneSettings({
    cf: legacy,
    action: "set",
    opts: { "zone-id": "z", setting: "dev" },
    body: { value: "off" },
    outputJson: true,
    printer,
    toJsonOutput,
    fail,
  });
  expect(toJsonOutput).toHaveBeenCalled();
});
test("uses direct client endpoints for settings reads and writes", async () => {
  const get = jest.fn().mockResolvedValue({ value: "on" });
  const patch = jest.fn().mockResolvedValue({ value: "off" });
  const toJsonOutput = jest.fn();
  const cf = { get, patch };
  const base = {
    cf,
    opts: { "zone-id": "z", setting: "ssl" },
    outputJson: true,
    toJsonOutput,
    fail: (message) => {
      throw new Error(message);
    },
  };
  await handleZoneSettings({ ...base, action: "get" });
  await handleZoneSettings({ ...base, action: "set", body: { value: "off" } });
  expect(get).toHaveBeenCalledWith("/zones/z/settings/ssl", undefined);
  expect(patch).toHaveBeenCalledWith("/zones/z/settings/ssl", { body: { value: "off" } });
  expect(toJsonOutput).toHaveBeenCalledTimes(2);
});
