import { jest } from "@jest/globals";
import { handleDnsRecords } from "../../../src/handlers/dns/records.mjs";

const context = (overrides = {}) => ({
  cf: { dns: { records: {} } },
  action: "list",
  opts: { "zone-id": "zone-1" },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("lists records from SDK and generic clients", async () => {
  const records = [{ id: "r1", type: "A", name: "www", content: "192.0.2.1" }];
  const toJsonOutput = jest.fn();
  const get = jest.fn().mockResolvedValue({ result: records });
  await handleDnsRecords(context({ cf: { get }, toJsonOutput }));
  expect(get).toHaveBeenCalledWith("/zones/zone-1/dns_records", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith(records);

  const list = jest.fn().mockResolvedValue(records);
  const printer = { log: jest.fn() };
  await handleDnsRecords(
    context({
      cf: { dns: { records: { list } } },
      outputJson: false,
      printer,
    }),
  );
  expect(list).toHaveBeenCalledWith({ zone_id: "zone-1" });
  expect(printer.log).toHaveBeenCalledWith(
    "ID  TYPE  NAME  CONTENT\n--  ----  ----  -------\nr1  A     www   192.0.2.1",
  );
});

test("uses default printer and accepts result arrays", async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  const records = [{ id: "r1", type: "A", name: "www", content: "192.0.2.1" }];
  await handleDnsRecords(
    context({
      cf: { get: jest.fn().mockResolvedValue({ result: records }) },
      outputJson: false,
      printer: undefined,
    }),
  );
  expect(console.log).toHaveBeenCalled();
  jest.restoreAllMocks();
});

test("routes get actions to the DNS record getter", async () => {
  const toJsonOutput = jest.fn();
  await handleDnsRecords(
    context({
      action: "get",
      opts: { "zone-id": "z", id: "r" },
      cf: { get: jest.fn().mockResolvedValue({ id: "record" }) },
      toJsonOutput,
    }),
  );
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "record" });
});

test("delegates diff and apply actions", async () => {
  const list = jest.fn().mockResolvedValue({ result: [] });
  const toJsonOutput = jest.fn();
  const cf = { get: jest.fn(), post: jest.fn() };
  await handleDnsRecords(context({ action: "diff", body: [], cf, toJsonOutput }));
  expect(cf.get).toHaveBeenCalledWith("/zones/zone-1/dns_records", undefined);
  await handleDnsRecords(
    context({
      action: "apply",
      body: [],
      opts: { "zone-id": "zone-1", "dry-run": true },
      cf,
      toJsonOutput,
    }),
  );
  expect(toJsonOutput).toHaveBeenCalled();
  expect(list).not.toHaveBeenCalled();
});

test("delegates mutation actions", async () => {
  const create = jest.fn().mockResolvedValue({ id: "created" });
  const toJsonOutput = jest.fn();
  await handleDnsRecords(
    context({
      action: "create",
      body: { type: "A" },
      cf: { dns: { records: { create } } },
      toJsonOutput,
    }),
  );
  expect(create).toHaveBeenCalled();
  const update = jest.fn().mockResolvedValue({ id: "updated" });
  await handleDnsRecords(
    context({
      action: "update",
      opts: { "zone-id": "z", id: "r" },
      body: { content: "192.0.2.3" },
      cf: { dns: { records: { update } } },
      toJsonOutput,
    }),
  );
  expect(update).toHaveBeenCalled();
  const remove = jest.fn().mockResolvedValue({ id: "deleted" });
  await handleDnsRecords(
    context({
      action: "delete",
      opts: { "zone-id": "z", id: "r", force: true },
      cf: { dns: { records: { delete: remove } } },
      toJsonOutput,
    }),
  );
  expect(remove).toHaveBeenCalled();

  const post = jest.fn().mockResolvedValue({ id: "generic-created" });
  const genericCreateOutput = jest.fn();
  await handleDnsRecords(
    context({
      action: "create",
      body: { type: "A", name: "www" },
      cf: { post },
      toJsonOutput: genericCreateOutput,
    }),
  );
  expect(post).toHaveBeenCalledWith("/zones/zone-1/dns_records", {
    body: { type: "A", name: "www" },
  });
  expect(genericCreateOutput).toHaveBeenCalledWith({ id: "generic-created" });

  const genericDelete = jest.fn().mockResolvedValue({ deleted: true });
  const genericDeleteOutput = jest.fn();
  await handleDnsRecords(
    context({
      action: "delete",
      opts: { "zone-id": "zone-1", id: "record-1", force: true },
      cf: { delete: genericDelete },
      toJsonOutput: genericDeleteOutput,
    }),
  );
  expect(genericDelete).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1");
  expect(genericDeleteOutput).toHaveBeenCalledWith({ deleted: true });
});

test("validates required values and rejects unknown actions", async () => {
  await expect(handleDnsRecords(context({ opts: {} }))).rejects.toThrow("Missing --zone-id");
  await expect(handleDnsRecords(context({ action: "get" }))).rejects.toThrow("Missing --id");
  await expect(handleDnsRecords(context({ action: "unknown" }))).rejects.toThrow(
    "Unknown dns-records action: unknown",
  );
});
