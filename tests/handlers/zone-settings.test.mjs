import { jest } from "@jest/globals";
import { handleZoneSettings } from "../../src/handlers/zone-settings.mjs";

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
  expect(cf.zones.settings.get).toHaveBeenCalledTimes(1);
  expect(cf.zones.settings.update).toHaveBeenCalledTimes(1);
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

import { fixtureCase1 } from "../../test-fixtures/unit/zone-settings-api.mjs";

test("handleZoneSettings covers API variants, dry-run, and text output", fixtureCase1);
