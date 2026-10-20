import { jest } from "@jest/globals";
import { getZoneSetting, setZoneSetting } from "../../../src/handlers/zone/settings-api.mjs";

test("uses direct API and typed SDK settings methods", async () => {
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

test("rejects zone setting updates when the SDK has no supported edit method", async () => {
  const cf = { zones: { settings: { get: jest.fn() } } };
  await expect(setZoneSetting(cf, "z", "ssl", "on")).rejects.toThrow(
    "Cloudflare SDK does not support zone setting updates",
  );
});
