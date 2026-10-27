import { jest } from "@jest/globals";

const writeDnsRecord = jest.fn();
const deleteDnsRecord = jest.fn();
jest.unstable_mockModule("../../../src/handlers/dns/mutation/write.mjs", () => ({
  writeDnsRecord,
}));
jest.unstable_mockModule("../../../src/handlers/dns/mutation/delete.mjs", () => ({
  deleteDnsRecord,
}));
const { handleDnsRecords } = await import("../../../src/handlers/dns/records.mjs");

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
  writeDnsRecord.mockClear();
  deleteDnsRecord.mockClear();
  await handleDnsRecords(
    context({
      action: "create",
      body: { type: "A" },
      cf: {},
    }),
  );
  expect(writeDnsRecord).toHaveBeenCalledWith(
    expect.objectContaining({ action: "create", zoneId: "zone-1", body: { type: "A" } }),
  );
  await handleDnsRecords(
    context({
      action: "update",
      opts: { "zone-id": "z", id: "r" },
      body: { content: "192.0.2.3" },
      cf: {},
    }),
  );
  expect(writeDnsRecord).toHaveBeenLastCalledWith(
    expect.objectContaining({ action: "update", zoneId: "z", id: "r" }),
  );
  await handleDnsRecords(
    context({
      action: "delete",
      opts: { "zone-id": "z", id: "r", force: true },
      cf: {},
    }),
  );
  expect(deleteDnsRecord).toHaveBeenCalledWith(
    expect.objectContaining({ action: "delete", zoneId: "z", id: "r" }),
  );
});

test("validates required values and rejects unknown actions", async () => {
  await expect(handleDnsRecords(context({ opts: {} }))).rejects.toThrow("Missing --zone-id");
  await expect(handleDnsRecords(context({ action: "get" }))).rejects.toThrow("Missing --id");
  await expect(handleDnsRecords(context({ action: "unknown" }))).rejects.toThrow(
    "Unknown dns-records action: unknown",
  );
});
