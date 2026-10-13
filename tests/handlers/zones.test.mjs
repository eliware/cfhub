import { jest } from "@jest/globals";
import { handleZones } from "../../src/handlers/zones.mjs";

test("handleZones is exported", () => {
  expect(typeof handleZones).toBe("function");
});

test("zone audit combines metadata, SSL, and DNS", async () => {
  const toJsonOutput = jest.fn();
  const ctx = {
    cf: {
      zones: { get: jest.fn().mockResolvedValue({ id: "z1" }) },
      get: jest.fn((path) =>
        path.includes("dns_records")
          ? { result: [{ name: "example.com" }] }
          : { id: "z1", value: "full" },
      ),
      dns: {
        records: { list: jest.fn().mockResolvedValue({ result: [{ name: "example.com" }] }) },
      },
    },
    action: "audit",
    opts: { "zone-id": "z1" },
    outputJson: true,
    toJsonOutput,
    fail: jest.fn(),
    printer: { log: jest.fn() },
  };
  await handleZones(ctx);
  expect(toJsonOutput).toHaveBeenCalledWith({
    zone: { id: "z1", value: "full" },
    ssl: { id: "z1", value: "full" },
    dns: [{ name: "example.com" }],
  });
  const text = { ...ctx, outputJson: false, toJsonOutput: jest.fn() };
  text.cf.dns.records.list.mockResolvedValue({ count: 0 });
  await handleZones(text);
  expect(text.printer.log).toHaveBeenCalledWith(
    JSON.stringify(
      {
        zone: { id: "z1", value: "full" },
        ssl: { id: "z1", value: "full" },
        dns: [{ name: "example.com" }],
      },
      null,
      2,
    ),
  );
});

test("zone security reports baseline settings", async () => {
  const toJsonOutput = jest.fn();
  const ctx = {
    cf: {
      get: jest.fn().mockResolvedValue({
        result: [
          { id: "ssl", value: "full" },
          { id: "tls_1_3", value: "on" },
        ],
      }),
    },
    action: "security",
    opts: { "zone-id": "z1" },
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
  };
  await handleZones(ctx);
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ zoneId: "z1", missing: expect.arrayContaining(["min_tls_version"]) }),
  );
  const text = {
    ...ctx,
    outputJson: false,
    printer: { log: jest.fn() },
    cf: { get: jest.fn().mockResolvedValue({}) },
  };
  await handleZones(text);
  expect(text.printer.log).toHaveBeenCalledWith(expect.stringContaining("missing"));
});
describe("handler command integration cases", () => {
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
  test("handleZones list prints simplified text rows when not JSON", async () => {
    const cf = {
      zones: { list: jest.fn().mockResolvedValue({ result: [{ id: "z1", name: "example.com" }] }) },
    };
    await handleZones({ cf, action: "list", opts: {}, outputJson: false, toJsonOutput, fail });
    expect(cf.zones.list).toHaveBeenCalledWith(undefined);
    expect(console.log).toHaveBeenCalledWith("ID  NAME\n--  ----\nz1  example.com");
  });

  test("handleZones supports account-scoped list and JSON output", async () => {
    const cf = {
      zones: { list: jest.fn().mockResolvedValue([{ id: "z2", name: "example.net" }]) },
    };
    await handleZones({
      cf,
      action: "list",
      opts: { "account-id": "acct1" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    expect(cf.zones.list).toHaveBeenCalledWith({ account: { id: "acct1" } });
    expect(toJsonOutput).toHaveBeenCalledWith([{ id: "z2", name: "example.net" }]);
  });

  test("handleZones get/update/delete and unknown action are covered", async () => {
    const cf = {
      zones: {
        get: jest.fn().mockResolvedValue({ id: "z1" }),
        edit: jest.fn().mockResolvedValue({ ok: true }),
        delete: jest.fn().mockResolvedValue({ deleted: true }),
      },
    };
    await handleZones({
      cf,
      action: "get",
      opts: { "zone-id": "z1" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "update",
      opts: { "zone-id": "z1" },
      body: { name: "x" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "delete",
      opts: { "zone-id": "z1", force: true },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await expect(
      handleZones({ cf, action: "bogus", opts: {}, outputJson: false, toJsonOutput, fail }),
    ).rejects.toThrow("Unknown zones action: bogus");
    expect(cf.zones.get).toHaveBeenCalledWith({ zone_id: "z1" });
    expect(cf.zones.edit).toHaveBeenCalledWith({ zone_id: "z1", name: "x" });
    expect(cf.zones.delete).toHaveBeenCalledWith({ zone_id: "z1" });
  });

  test("handleZones create respects dry-run and real create", async () => {
    const cf = { zones: { create: jest.fn().mockResolvedValue({ created: true }) } };
    await handleZones({
      cf,
      action: "create",
      opts: { "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "create",
      opts: {},
      body: { name: "x" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    expect(cf.zones.create).toHaveBeenCalledWith({ name: "x" });
  });

  test("handleZones covers text mutation and dry-run branches", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    const cf = {
      zones: {
        get: jest.fn().mockResolvedValue({ id: "z" }),
        create: jest.fn().mockResolvedValue({ created: true }),
        edit: jest.fn().mockResolvedValue({ updated: true }),
        delete: jest.fn().mockResolvedValue({ deleted: true }),
      },
    };
    await handleZones({
      cf,
      action: "get",
      opts: { "zone-id": "z" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "create",
      opts: { "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "create",
      opts: {},
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "update",
      opts: { "zone-id": "z", "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "update",
      opts: { "zone-id": "z" },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleZones({
      cf,
      action: "delete",
      opts: { "zone-id": "z", force: true },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    expect(printer.log).toHaveBeenCalled();
  });

  test("handleZones update supports JSON output", async () => {
    const toJsonOutput = jest.fn();
    const cf = { zones: { edit: jest.fn().mockResolvedValue({ updated: true }) } };
    await handleZones({
      cf,
      action: "update",
      opts: { "zone-id": "z" },
      body: { name: "x" },
      outputJson: true,
      printer: { log: jest.fn() },
      toJsonOutput,
      fail: jest.fn(),
    });
    expect(toJsonOutput).toHaveBeenCalledWith({ updated: true });
  });
});
