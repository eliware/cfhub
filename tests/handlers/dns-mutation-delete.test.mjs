import { jest } from "@jest/globals";
import { deleteDnsRecord } from "../../src/handlers/dns-mutation-delete.mjs";

const context = (overrides = {}) => ({
  zoneId: "zone-1",
  id: "record-1",
  opts: { force: true },
  cf: {},
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("deletes records through generic clients and the Cloudflare SDK", async () => {
  const remove = jest.fn().mockResolvedValue({ deleted: true });
  const generic = context({ cf: { delete: remove } });
  await deleteDnsRecord(generic);
  expect(remove).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1");
  expect(generic.toJsonOutput).toHaveBeenCalledWith({ deleted: true });

  const deleteRecord = jest.fn().mockResolvedValue({ deleted: "sdk" });
  const sdk = context({
    cf: { dns: { records: { delete: deleteRecord } } },
    outputJson: false,
  });
  await deleteDnsRecord(sdk);
  expect(deleteRecord).toHaveBeenCalledWith("record-1", { zone_id: "zone-1" });
  expect(sdk.printer.log).toHaveBeenCalledWith('{\n  "deleted": "sdk"\n}');
});

test("requires an ID and force before deletion", async () => {
  await expect(deleteDnsRecord(context({ id: null }))).rejects.toThrow("Missing --id");
  await expect(deleteDnsRecord(context({ opts: {} }))).rejects.toThrow(
    "Refusing to delete without --force",
  );
});

test("previews deletion without calling the client in dry-run mode", async () => {
  const remove = jest.fn();
  const input = context({ cf: { delete: remove }, opts: { force: true, "dry-run": true } });
  await deleteDnsRecord(input);
  expect(remove).not.toHaveBeenCalled();
  expect(input.printer.log).toHaveBeenCalledWith(
    JSON.stringify({ action: "delete", zoneId: "zone-1", id: "record-1", dryRun: true }, null, 2),
  );
});
