import { jest } from "@jest/globals";
import { handleZones } from "../../src/handlers/zones.mjs";
import { handleZoneSettings } from "../../src/handlers/zone-settings.mjs";
import { handleDnsRecords } from "../../src/handlers/dns-records.mjs";
import { handleRulesets } from "../../src/handlers/rulesets.mjs";
import { handleListItems } from "../../src/handlers/list-items.mjs";

test("covers mutating dry-run and real branches", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const fail = jest.fn((msg) => {
    throw new Error(msg);
  });
  const out = jest.fn();
  const common = { outputJson: false, printer, toJsonOutput: out, fail };
  await handleDnsRecords({
    ...common,
    cf: { dns: { records: { create: jest.fn(), update: jest.fn().mockResolvedValue({ ok: 1 }) } } },
    action: "create",
    opts: { "zone-id": "z", "dry-run": true },
    body: { type: "A" },
  });
  await handleDnsRecords({
    ...common,
    cf: { dns: { records: { create: jest.fn().mockResolvedValue({ ok: 1 }), update: jest.fn() } } },
    action: "create",
    opts: { "zone-id": "z" },
    body: { type: "A" },
  });
  await handleDnsRecords({
    ...common,
    cf: { dns: { records: { create: jest.fn(), update: jest.fn().mockResolvedValue({ ok: 1 }) } } },
    action: "update",
    opts: { "zone-id": "z", id: "r", "dry-run": true },
    body: { content: "x" },
  });
  await handleDnsRecords({
    ...common,
    cf: { dns: { records: { create: jest.fn(), update: jest.fn().mockResolvedValue({ ok: 1 }) } } },
    action: "update",
    opts: { "zone-id": "z", id: "r" },
    body: { content: "x" },
  });

  async function* items() {
    yield { id: "i" };
  }
  await handleListItems({
    ...common,
    cf: {
      rules: {
        lists: {
          items: { list: jest.fn().mockReturnValue(items()), create: jest.fn(), delete: jest.fn() },
        },
      },
    },
    action: "create",
    opts: { "account-id": "a", id: "l", "dry-run": true },
    body: { ip: "1.1.1.1" },
  });
  await handleListItems({
    ...common,
    cf: {
      rules: {
        lists: {
          items: {
            list: jest.fn(),
            create: jest.fn().mockResolvedValue({ ok: 1 }),
            delete: jest.fn(),
          },
        },
      },
    },
    action: "create",
    opts: { "account-id": "a", id: "l" },
    body: [{ ip: "1.1.1.1" }],
  });
  await handleListItems({
    ...common,
    cf: {
      rules: {
        lists: {
          items: {
            list: jest.fn(),
            create: jest.fn(),
            delete: jest.fn().mockResolvedValue({ ok: 1 }),
          },
        },
      },
    },
    action: "delete",
    opts: { "account-id": "a", id: "l", force: true },
    body: { ids: ["i"] },
  });

  await handleRulesets({
    ...common,
    cf: { rulesets: { create: jest.fn(), update: jest.fn().mockResolvedValue({ ok: 1 }) } },
    action: "create",
    opts: { "zone-id": "z", "dry-run": true },
    body: { name: "x" },
  });
  await handleZoneSettings({
    ...common,
    cf: { zones: { settings: { get: jest.fn(), edit: jest.fn().mockResolvedValue({ ok: 1 }) } } },
    action: "set",
    opts: { "zone-id": "z", setting: "dev" },
    body: { value: "on" },
  });
  await handleZones({
    ...common,
    cf: { zones: { create: jest.fn(), edit: jest.fn().mockResolvedValue({ ok: 1 }) } },
    action: "update",
    opts: { "zone-id": "z" },
    body: { name: "x" },
  });
});
