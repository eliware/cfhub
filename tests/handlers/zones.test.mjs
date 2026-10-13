import { jest } from "@jest/globals";
import { handleZones } from "../../src/handlers/zones.mjs";
import { context } from "../../test-fixtures/zones-context.mjs";

test("zone listing supports SDK and generic clients", async () => {
  const toJsonOutput = jest.fn();
  const generic = jest.fn().mockResolvedValue({ result: [{ id: "z1" }] });
  await handleZones(context({ cf: { get: generic }, toJsonOutput }));
  expect(generic).toHaveBeenCalledWith("/zones", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith([{ id: "z1" }]);

  const accountGet = jest.fn().mockResolvedValue([{ id: "z2" }]);
  await handleZones(context({ cf: { get: accountGet }, opts: { "account-id": "a1" } }));
  expect(accountGet).toHaveBeenCalledWith("/zones?account.id=a1", undefined);

  const sdkList = jest.fn().mockResolvedValue({ result: [{ id: "z3", name: "site" }] });
  const printer = { log: jest.fn() };
  await handleZones(context({ cf: { zones: { list: sdkList } }, outputJson: false, printer }));
  expect(sdkList).toHaveBeenCalledWith(undefined);
  expect(printer.log).toHaveBeenCalledWith("ID  NAME\n--  ----\nz3  site");

  const sdkAccountList = jest.fn().mockResolvedValue([]);
  await handleZones(
    context({ cf: { zones: { list: sdkAccountList } }, opts: { "account-id": "a2" } }),
  );
  expect(sdkAccountList).toHaveBeenCalledWith({ account: { id: "a2" } });

  const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  await handleZones(
    context({
      cf: { zones: { list: jest.fn().mockResolvedValue([]) } },
      outputJson: false,
      printer: undefined,
    }),
  );
  expect(consoleLog).toHaveBeenCalled();
  consoleLog.mockRestore();
});

test("zone reads support SDK and generic clients", async () => {
  const generic = jest.fn().mockResolvedValue({ id: "z1" });
  const toJsonOutput = jest.fn();
  await handleZones(
    context({ action: "get", cf: { get: generic }, opts: { "zone-id": "z1" }, toJsonOutput }),
  );
  expect(generic).toHaveBeenCalledWith("/zones/z1", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "z1" });

  const sdkGet = jest.fn().mockResolvedValue({ id: "z2" });
  const printer = { log: jest.fn() };
  await handleZones(
    context({
      action: "get",
      cf: { zones: { get: sdkGet } },
      opts: { "zone-id": "z2" },
      outputJson: false,
      printer,
    }),
  );
  expect(sdkGet).toHaveBeenCalledWith({ zone_id: "z2" });
  expect(printer.log).toHaveBeenCalledWith('{\n  "id": "z2"\n}');
});

test("zone report actions stay connected to their report handler", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [] }) };
  const fail = jest.fn();
  const toJsonOutput = jest.fn();
  for (const action of ["audit", "security"])
    await handleZones(context({ action, cf, opts: { "zone-id": "z1" }, fail, toJsonOutput }));
  expect(cf.get).toHaveBeenCalled();
  expect(toJsonOutput).toHaveBeenCalled();
});

test("zone creation supports dry runs and both client styles", async () => {
  const body = { name: "example.com" };
  const printer = { log: jest.fn() };
  const sdkCreate = jest.fn().mockResolvedValue({ created: true });
  await handleZones(
    context({
      action: "create",
      cf: { zones: { create: sdkCreate } },
      opts: { "dry-run": true },
      body,
      outputJson: false,
      printer,
    }),
  );
  expect(sdkCreate).not.toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith(
    JSON.stringify({ action: "create", body, dryRun: true }, null, 2),
  );

  const post = jest.fn().mockResolvedValue({ created: true });
  const toJsonOutput = jest.fn();
  await handleZones(context({ action: "create", cf: { post }, body, toJsonOutput }));
  expect(post).toHaveBeenCalledWith("/zones", { body });
  expect(toJsonOutput).toHaveBeenCalledWith({ created: true });

  const legacyCreate = jest.fn().mockResolvedValue({ created: true });
  const textPrinter = { log: jest.fn() };
  await handleZones(
    context({
      action: "create",
      cf: { zones: { create: legacyCreate } },
      body,
      outputJson: false,
      printer: textPrinter,
    }),
  );
  expect(textPrinter.log).toHaveBeenCalledWith('{\n  "created": true\n}');
});

test("zone updates support dry runs and both client styles", async () => {
  const body = { name: "example.com" };
  const printer = { log: jest.fn() };
  const patch = jest.fn().mockResolvedValue({ updated: true });
  await handleZones(
    context({
      action: "update",
      cf: { patch },
      opts: { "zone-id": "z1", "dry-run": true },
      body,
      outputJson: false,
      printer,
    }),
  );
  expect(patch).not.toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith(
    JSON.stringify({ zoneId: "z1", action: "update", body, dryRun: true }, null, 2),
  );

  const sdkEdit = jest.fn().mockResolvedValue({ updated: true });
  await handleZones(
    context({
      action: "update",
      cf: { zones: { edit: sdkEdit } },
      opts: { "zone-id": "z1" },
      body,
    }),
  );
  expect(sdkEdit).toHaveBeenCalledWith({ zone_id: "z1", ...body });

  const genericPatch = jest.fn().mockResolvedValue({ updated: true });
  const textPrinter = { log: jest.fn() };
  await handleZones(
    context({
      action: "update",
      cf: { patch: genericPatch },
      opts: { "zone-id": "z1" },
      body,
      outputJson: false,
      printer: textPrinter,
    }),
  );
  expect(genericPatch).toHaveBeenCalledWith("/zones/z1", { body });
  expect(textPrinter.log).toHaveBeenCalledWith('{\n  "updated": true\n}');
});

test("zone deletion supports both client styles and force checks", async () => {
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
});

test("zone handler rejects unknown actions", async () => {
  await expect(handleZones(context({ action: "unknown" }))).rejects.toThrow(
    "Unknown zones action: unknown",
  );
});
