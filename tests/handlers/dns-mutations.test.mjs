import { jest } from "@jest/globals";
import { handleDnsMutation } from "../../src/handlers/dns-mutations.mjs";

const context = (overrides = {}) => ({
  action: "create",
  zoneId: "zone-1",
  id: "record-1",
  body: { type: "A", name: "www" },
  opts: {},
  cf: {},
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("creates records through SDK and generic clients", async () => {
  const post = jest.fn().mockResolvedValue({ id: "sdk" });
  const sdk = context({ cf: { post } });
  await handleDnsMutation(sdk);
  expect(post).toHaveBeenCalledWith("/zones/zone-1/dns_records", { body: sdk.body });
  expect(sdk.toJsonOutput).toHaveBeenCalledWith({ id: "sdk" });

  const create = jest.fn().mockResolvedValue({ id: "generic" });
  const generic = context({ cf: { dns: { records: { create } } }, outputJson: false });
  await handleDnsMutation(generic);
  expect(create).toHaveBeenCalledWith({ zone_id: "zone-1", ...generic.body });
  expect(generic.printer.log).toHaveBeenCalledWith('{\n  "id": "generic"\n}');
});

test("validates create data and supports dry-run", async () => {
  await expect(handleDnsMutation(context({ body: null }))).rejects.toThrow(
    "Missing --data or --file",
  );
  const printer = { log: jest.fn() };
  const cf = {};
  await handleDnsMutation(context({ opts: { "dry-run": true }, printer, cf }));
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
  expect(cf).toEqual({});
});

test("updates records through SDK and generic clients", async () => {
  const put = jest.fn().mockResolvedValue({ updated: "sdk" });
  const sdk = context({ action: "update", cf: { put } });
  await handleDnsMutation(sdk);
  expect(put).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1", { body: sdk.body });

  const update = jest.fn().mockResolvedValue({ updated: "generic" });
  const generic = context({
    action: "update",
    cf: { dns: { records: { update } } },
    outputJson: false,
  });
  await handleDnsMutation(generic);
  expect(update).toHaveBeenCalledWith("record-1", { zone_id: "zone-1", ...generic.body });
  expect(generic.printer.log).toHaveBeenCalledWith('{\n  "updated": "generic"\n}');
});

test("validates update inputs and supports dry-run", async () => {
  await expect(handleDnsMutation(context({ action: "update", id: null }))).rejects.toThrow(
    "Missing --id",
  );
  await expect(handleDnsMutation(context({ action: "update", body: null }))).rejects.toThrow(
    "Missing --data or --file",
  );
  const printer = { log: jest.fn() };
  await handleDnsMutation(context({ action: "update", opts: { "dry-run": true }, printer }));
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
});

test("deletes records through SDK and generic clients", async () => {
  const remove = jest.fn().mockResolvedValue({ deleted: "sdk" });
  const sdk = context({ action: "delete", opts: { force: true }, cf: { delete: remove } });
  await handleDnsMutation(sdk);
  expect(remove).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1");

  const deleteRecord = jest.fn().mockResolvedValue({ deleted: "generic" });
  const generic = context({
    action: "delete",
    opts: { force: true },
    cf: { dns: { records: { delete: deleteRecord } } },
    outputJson: false,
  });
  await handleDnsMutation(generic);
  expect(deleteRecord).toHaveBeenCalledWith("record-1", { zone_id: "zone-1" });
  expect(generic.printer.log).toHaveBeenCalledWith('{\n  "deleted": "generic"\n}');
});

test("requires an ID and force for deletes", async () => {
  await expect(handleDnsMutation(context({ action: "delete", id: null }))).rejects.toThrow(
    "Missing --id",
  );
  await expect(handleDnsMutation(context({ action: "delete" }))).rejects.toThrow(
    "Refusing to delete without --force",
  );
});
