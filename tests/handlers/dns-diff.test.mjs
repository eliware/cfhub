import { jest } from "@jest/globals";
import { handleDnsDiff } from "../../src/handlers/dns-diff.mjs";

const context = (overrides = {}) => ({
  action: "diff",
  zoneId: "zone-1",
  opts: {},
  body: [],
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  cf: {},
  listRecords: jest.fn().mockResolvedValue({ result: [] }),
  ...overrides,
});

test("plans record additions, removals, and unchanged records", async () => {
  const keep = { type: "A", name: "keep", content: "192.0.2.1", ttl: 60, proxied: false };
  const stale = { type: "A", name: "old", content: "192.0.2.2", ttl: 60, proxied: false };
  const desired = [keep, { type: "A", name: "new", content: "192.0.2.3", ttl: 60, proxied: true }];
  const toJsonOutput = jest.fn();
  await handleDnsDiff(
    context({
      body: { records: desired },
      toJsonOutput,
      listRecords: jest.fn().mockResolvedValue({ result: [keep, stale] }),
    }),
  );
  expect(toJsonOutput).toHaveBeenCalledWith({
    zoneId: "zone-1",
    add: [desired[1]],
    remove: [stale],
    unchanged: [keep],
  });
});

test("accepts empty response shapes and prints dry-run plans", async () => {
  const printer = { log: jest.fn() };
  await handleDnsDiff(
    context({
      action: "apply",
      opts: { "dry-run": true },
      body: [],
      outputJson: false,
      printer,
      listRecords: jest.fn().mockResolvedValue({ result: "unexpected" }),
    }),
  );
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"unchanged": []'));
});

test("validates the desired record body", async () => {
  await expect(handleDnsDiff(context({ body: null }))).rejects.toThrow(
    "Missing desired records in --data or --file",
  );
  await expect(handleDnsDiff(context({ body: {} }))).rejects.toThrow(
    "Expected an array of desired records",
  );
});

test("requires force before applying record changes", async () => {
  const record = { type: "A", name: "new", content: "192.0.2.4" };
  await expect(handleDnsDiff(context({ action: "apply", body: [record] }))).rejects.toThrow(
    "Refusing DNS apply without --force",
  );
});

test("applies changes through SDK methods and reports JSON", async () => {
  const add = { type: "A", name: "new", content: "192.0.2.4" };
  const remove = { type: "A", name: "old", content: "192.0.2.5", id: "old-id" };
  const post = jest.fn();
  const removeRequest = jest.fn();
  const toJsonOutput = jest.fn();
  await handleDnsDiff(
    context({
      action: "apply",
      opts: { force: true },
      body: [add],
      cf: { post, delete: removeRequest },
      listRecords: jest.fn().mockResolvedValue({ result: [remove] }),
      toJsonOutput,
    }),
  );
  expect(post).toHaveBeenCalledWith("/zones/zone-1/dns_records", { body: add });
  expect(removeRequest).toHaveBeenCalledWith("/zones/zone-1/dns_records/old-id");
  expect(toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ applied: true }));
});

test("applies changes through generic methods and prints the result", async () => {
  const add = { type: "A", name: "new", content: "192.0.2.4" };
  const remove = { type: "A", name: "old", content: "192.0.2.5", id: "old-id" };
  const create = jest.fn();
  const removeRecord = jest.fn();
  const printer = { log: jest.fn() };
  await handleDnsDiff(
    context({
      action: "apply",
      opts: { force: true },
      body: [add],
      outputJson: false,
      printer,
      cf: { dns: { records: { create, delete: removeRecord } } },
      listRecords: jest.fn().mockResolvedValue({ result: [remove] }),
    }),
  );
  expect(create).toHaveBeenCalledWith({ zone_id: "zone-1", ...add });
  expect(removeRecord).toHaveBeenCalledWith("old-id", { zone_id: "zone-1" });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"applied": true'));
});
