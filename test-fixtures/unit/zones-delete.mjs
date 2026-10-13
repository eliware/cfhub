import { jest } from "@jest/globals";
import { handleZones } from "../../src/handlers/zones.mjs";
import { context } from "../zones-context.mjs";

export async function fixtureCase1() {
  const remove = jest.fn().mockResolvedValue({ deleted: true });
  const toJsonOutput = jest.fn();
  await handleZones(
    context({
      action: "delete",
      cf: { delete: remove },
      opts: { "zone-id": "z1", force: true },
      toJsonOutput,
    }),
  );
  expect(remove).toHaveBeenCalledWith("/zones/z1");
  expect(toJsonOutput).toHaveBeenCalledWith({ deleted: true });

  const sdkDelete = jest.fn().mockResolvedValue({ deleted: true });
  const printer = { log: jest.fn() };
  await handleZones(
    context({
      action: "delete",
      cf: { zones: { delete: sdkDelete } },
      opts: { "zone-id": "z2", force: true },
      outputJson: false,
      printer,
    }),
  );
  expect(sdkDelete).toHaveBeenCalledWith({ zone_id: "z2" });
  expect(printer.log).toHaveBeenCalledWith('{\n  "deleted": true\n}');

  const fail = jest.fn((message) => {
    throw new Error(message);
  });
  await expect(
    handleZones(context({ action: "delete", opts: { "zone-id": "z1" }, fail })),
  ).rejects.toThrow("Refusing to delete without --force");
}
