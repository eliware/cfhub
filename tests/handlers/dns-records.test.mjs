import { jest } from "@jest/globals";
import { handleDnsRecords } from "../../src/handlers/dns-records.mjs";

test("DNS diff plans and apply mutates only differences", async () => {
  const create = jest.fn();
  const remove = jest.fn();
  const toJsonOutput = jest.fn();
  const current = {
    type: "A",
    name: "keep",
    content: "192.0.2.1",
    ttl: 60,
    proxied: false,
    id: "old",
  };
  const ctx = {
    cf: {
      dns: {
        records: {
          list: jest.fn().mockResolvedValue({ result: [current] }),
          create,
          delete: remove,
        },
      },
    },
    action: "diff",
    opts: { "zone-id": "z1" },
    body: {
      records: [
        { ...current },
        { type: "A", name: "new", content: "192.0.2.2", ttl: 60, proxied: false },
      ],
    },
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
  };
  await handleDnsRecords(ctx);
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ add: [expect.objectContaining({ name: "new" })], remove: [] }),
  );
  await handleDnsRecords({ ...ctx, action: "apply", opts: { "zone-id": "z1", force: true } });
  expect(create).toHaveBeenCalled();
});

test("DNS apply removes stale records and rejects unsafe apply", async () => {
  const remove = jest.fn();
  const printer = { log: jest.fn() };
  const stale = {
    type: "A",
    name: "stale",
    content: "192.0.2.9",
    ttl: 60,
    proxied: false,
    id: "stale-id",
  };
  const base = {
    cf: {
      dns: {
        records: {
          list: jest.fn().mockResolvedValue({ result: [stale] }),
          create: jest.fn(),
          delete: remove,
        },
      },
    },
    opts: { "zone-id": "z1" },
    body: [{ type: "A", name: "desired", content: "192.0.2.8", ttl: 60, proxied: false }],
    outputJson: false,
    printer,
    toJsonOutput: jest.fn(),
    fail: jest.fn(),
  };
  await handleDnsRecords({ ...base, action: "apply" });
  expect(base.fail).toHaveBeenCalledWith(expect.stringContaining("force"));
  await handleDnsRecords({ ...base, action: "apply", opts: { "zone-id": "z1", force: true } });
  expect(remove).toHaveBeenCalledWith("stale-id", { zone_id: "z1" });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("applied"));
});

test("DNS diff accepts array bodies and dry-run with unusual response shapes", async () => {
  const ctx = {
    cf: {
      dns: {
        records: { list: jest.fn().mockResolvedValue({}), create: jest.fn(), delete: jest.fn() },
      },
    },
    action: "apply",
    opts: { "zone-id": "z1", "dry-run": true },
    body: [],
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail: jest.fn(),
  };
  await handleDnsRecords(ctx);
  expect(ctx.toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ add: [], remove: [] }));
  const text = { ...ctx, outputJson: false, printer: { log: jest.fn() } };
  await handleDnsRecords(text);
  expect(text.printer.log).toHaveBeenCalledWith(expect.stringContaining("add"));
});

test("handleDnsRecords is exported", () => {
  expect(typeof handleDnsRecords).toBe("function");
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
  test("handleDnsRecords list/get/create/update/delete/unknown", async () => {
    const cf = {
      dns: {
        records: {
          list: jest.fn().mockResolvedValue({
            result: [{ id: "r1", type: "A", name: "www", content: "1.2.3.4" }],
          }),
          get: jest.fn().mockResolvedValue({ id: "r1" }),
          create: jest.fn().mockResolvedValue({ created: true }),
          update: jest.fn().mockResolvedValue({ updated: true }),
          delete: jest.fn().mockResolvedValue({ deleted: true }),
        },
      },
    };
    await handleDnsRecords({
      cf,
      action: "list",
      opts: { "zone-id": "z1" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "get",
      opts: { "zone-id": "z1", id: "r1" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "create",
      opts: { "zone-id": "z1" },
      body: { type: "A" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "update",
      opts: { "zone-id": "z1", id: "r1" },
      body: { content: "5.6.7.8" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "delete",
      opts: { "zone-id": "z1", id: "r1", force: true },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await expect(
      handleDnsRecords({
        cf,
        action: "bogus",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Unknown dns-records action: bogus");
    expect(console.log).toHaveBeenCalledWith(
      "ID  TYPE  NAME  CONTENT\n--  ----  ----  -------\nr1  A     www   1.2.3.4",
    );
  });

  test("handleDnsRecords validates missing inputs", async () => {
    const cf = { dns: { records: { list: jest.fn() } } };
    await expect(
      handleDnsRecords({ cf, action: "list", opts: {}, outputJson: false, toJsonOutput, fail }),
    ).rejects.toThrow("Missing --zone-id");
    await expect(
      handleDnsRecords({
        cf,
        action: "get",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --id");
    await expect(
      handleDnsRecords({
        cf,
        action: "create",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --data or --file");
    await expect(
      handleDnsRecords({
        cf,
        action: "update",
        opts: { "zone-id": "z1", id: "r1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --data or --file");
    await expect(
      handleDnsRecords({
        cf,
        action: "delete",
        opts: { "zone-id": "z1", id: "r1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Refusing to delete without --force");
  });

  test("handleDnsRecords covers raw-list and text mutation branches", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    const cf = {
      dns: {
        records: {
          list: jest
            .fn()
            .mockResolvedValue([{ id: "r", type: "A", name: "x", content: "1.2.3.4" }]),
          get: jest.fn().mockResolvedValue({ id: "r" }),
          create: jest.fn().mockResolvedValue({ created: true }),
          delete: jest.fn().mockResolvedValue({ deleted: true }),
        },
      },
    };
    await handleDnsRecords({
      cf,
      action: "list",
      opts: { "zone-id": "z" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "get",
      opts: { "zone-id": "z", id: "r" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "create",
      opts: { "zone-id": "z" },
      body: { type: "A" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "delete",
      opts: { "zone-id": "z", id: "r", force: true },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    expect(printer.log).toHaveBeenCalled();
  });

  test("handleDnsRecords covers JSON list/create/delete outputs", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    const cf = {
      dns: {
        records: {
          list: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue({ created: true }),
          delete: jest.fn().mockResolvedValue({ deleted: true }),
        },
      },
    };
    await handleDnsRecords({
      cf,
      action: "list",
      opts: { "zone-id": "z" },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "create",
      opts: { "zone-id": "z" },
      body: { type: "A" },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    await handleDnsRecords({
      cf,
      action: "delete",
      opts: { "zone-id": "z", id: "r", force: true },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    expect(toJsonOutput).toHaveBeenCalledTimes(3);
  });
});
