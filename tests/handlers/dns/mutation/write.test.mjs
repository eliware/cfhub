import { jest } from "@jest/globals";
import { writeDnsRecord } from "../../../../src/handlers/dns/mutation/write.mjs";

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

test("creates and updates records through generic clients", async () => {
  const post = jest.fn().mockResolvedValue({ id: "created" });
  const create = context({ cf: { post } });
  await writeDnsRecord(create);
  expect(post).toHaveBeenCalledWith("/zones/zone-1/dns_records", { body: create.body });
  expect(create.toJsonOutput).toHaveBeenCalledWith({ id: "created" });

  const put = jest.fn().mockResolvedValue({ id: "updated" });
  const update = context({ action: "update", cf: { put }, outputJson: false });
  await writeDnsRecord(update);
  expect(put).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1", { body: update.body });
  expect(update.printer.log).toHaveBeenCalledWith('{\n  "id": "updated"\n}');
});

test("creates and updates records through the Cloudflare SDK", async () => {
  const create = jest.fn().mockResolvedValue({ id: "created" });
  await writeDnsRecord(context({ cf: { dns: { records: { create } } } }));
  expect(create).toHaveBeenCalledWith({ zone_id: "zone-1", type: "A", name: "www" });

  const update = jest.fn().mockResolvedValue({ id: "updated" });
  await writeDnsRecord(context({ action: "update", cf: { dns: { records: { update } } } }));
  expect(update).toHaveBeenCalledWith("record-1", { zone_id: "zone-1", type: "A", name: "www" });
});

test("checks write inputs and supports dry runs", async () => {
  await expect(writeDnsRecord(context({ body: null }))).rejects.toThrow("Missing --data or --file");
  await expect(writeDnsRecord(context({ action: "update", id: null }))).rejects.toThrow(
    "Missing --id",
  );
  await expect(writeDnsRecord(context({ action: "update", body: null }))).rejects.toThrow(
    "Missing --data or --file",
  );

  const printer = { log: jest.fn() };
  const cf = {};
  await writeDnsRecord(context({ opts: { "dry-run": true }, printer, cf }));
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
  await writeDnsRecord(context({ action: "update", opts: { "dry-run": true }, printer, cf }));
  expect(printer.log).toHaveBeenLastCalledWith(expect.stringContaining('"id": "record-1"'));
  expect(cf).toEqual({});
});
