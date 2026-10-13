import { jest } from "@jest/globals";
import { handleZoneSettings } from "../../src/handlers/zone-settings.mjs";

export async function fixtureCase1() {
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
}

export async function fixtureCase2() {
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
}
