import { jest } from "@jest/globals";
import { getZoneSetting, setZoneSetting } from "../../../src/handlers/zone/settings-api.mjs";

test("calls modern and legacy settings endpoints", async () => {
  const modern = { get: jest.fn(), patch: jest.fn() };
  await getZoneSetting(modern, "z", "ssl");
  await setZoneSetting(modern, "z", "ssl", "on");
  expect(modern.get).toHaveBeenCalledWith("/zones/z/settings/ssl", undefined);
  expect(modern.patch).toHaveBeenCalledWith("/zones/z/settings/ssl", { body: { value: "on" } });
  const legacy = {
    zones: {
      settings: {
        get: jest.fn(function (setting, options) {
          return options ? setting : undefined;
        }),
        edit: jest.fn(),
        update: jest.fn(),
      },
    },
  };
  await getZoneSetting(legacy, "z", "ssl");
  await setZoneSetting(legacy, "z", "ssl", "on");
  expect(legacy.zones.settings.get).toHaveBeenCalledWith("ssl", { zone_id: "z" });
  expect(legacy.zones.settings.edit).toHaveBeenCalledWith("ssl", { zone_id: "z", value: "on" });
});

test("uses the older positional settings methods", async () => {
  const get = jest.fn(function () {});
  const update = jest.fn();
  const cf = { zones: { settings: { get, update } } };
  await getZoneSetting(cf, "z", "ssl");
  await setZoneSetting(cf, "z", "ssl", "on");
  expect(get).toHaveBeenCalledWith("z", "ssl");
  expect(update).toHaveBeenCalledWith("z", "ssl", { value: "on" });
});
