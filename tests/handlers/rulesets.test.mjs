import { jest } from "@jest/globals";
import { handleRulesets } from "../../src/handlers/rulesets.mjs";

const context = (action, opts, overrides = {}) => ({
  action,
  opts,
  cf: {
    rulesets: {
      list: jest.fn().mockResolvedValue({ list: true }),
      get: jest.fn().mockResolvedValue({ get: true }),
      create: jest.fn().mockResolvedValue({ create: true }),
      update: jest.fn().mockResolvedValue({ update: true }),
    },
  },
  body: { name: "rules" },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("lists and gets rulesets for zones and accounts", async () => {
  const zoneList = context("list", { "zone-id": "z" });
  await handleRulesets(zoneList);
  expect(zoneList.cf.rulesets.list).toHaveBeenCalledWith({ zone_id: "z" });
  const accountList = context("list", { "account-id": "a" }, { outputJson: false });
  await handleRulesets(accountList);
  expect(accountList.cf.rulesets.list).toHaveBeenCalledWith({ account_id: "a" });
  expect(accountList.printer.log).toHaveBeenCalled();
  const zoneGet = context("get", { "zone-id": "z", id: "r" }, { outputJson: false });
  await handleRulesets(zoneGet);
  expect(zoneGet.cf.rulesets.get).toHaveBeenCalledWith("r", { zone_id: "z" });
  const accountGet = context("get", { "account-id": "a", id: "r" });
  await handleRulesets(accountGet);
  expect(accountGet.cf.rulesets.get).toHaveBeenCalledWith("r", { account_id: "a" });
});

test("uses SDK routes for list and get", async () => {
  const get = jest.fn().mockResolvedValue({ data: true });
  const zone = context("list", { "zone-id": "z" }, { cf: { get } });
  await handleRulesets(zone);
  expect(get).toHaveBeenCalledWith("/zones/z/rulesets", undefined);
  const account = context("list", { "account-id": "a" }, { cf: { get }, outputJson: false });
  await handleRulesets(account);
  expect(get).toHaveBeenCalledWith("/accounts/a/rulesets", undefined);
  const zoneGet = context("get", { "zone-id": "z", id: "r" }, { cf: { get } });
  await handleRulesets(zoneGet);
  expect(get).toHaveBeenCalledWith("/zones/z/rulesets/r", undefined);
  const accountGet = context(
    "get",
    { "account-id": "a", id: "r" },
    { cf: { get }, outputJson: false },
  );
  await handleRulesets(accountGet);
  expect(get).toHaveBeenCalledWith("/accounts/a/rulesets/r", undefined);
});

test("creates and updates rulesets through generic zone and account clients", async () => {
  const zoneCreate = context("create", { "zone-id": "z" }, { outputJson: false });
  await handleRulesets(zoneCreate);
  expect(zoneCreate.cf.rulesets.create).toHaveBeenCalledWith({ zone_id: "z", name: "rules" });
  const accountCreate = context("create", { "account-id": "a" });
  await handleRulesets(accountCreate);
  expect(accountCreate.cf.rulesets.create).toHaveBeenCalledWith({ account_id: "a", name: "rules" });
  const zoneUpdate = context("update", { "zone-id": "z", id: "r" });
  await handleRulesets(zoneUpdate);
  expect(zoneUpdate.cf.rulesets.update).toHaveBeenCalledWith("r", { zone_id: "z", name: "rules" });
  const accountUpdate = context("update", { "account-id": "a", id: "r" }, { outputJson: false });
  await handleRulesets(accountUpdate);
  expect(accountUpdate.cf.rulesets.update).toHaveBeenCalledWith("r", {
    account_id: "a",
    name: "rules",
  });
});

test("creates and updates rulesets through SDK routes", async () => {
  const post = jest.fn().mockResolvedValue({ saved: true });
  const put = jest.fn().mockResolvedValue({ saved: true });
  await handleRulesets(context("create", { "zone-id": "z" }, { cf: { post }, outputJson: false }));
  await handleRulesets(context("create", { "account-id": "a" }, { cf: { post } }));
  expect(post).toHaveBeenNthCalledWith(1, "/zones/z/rulesets", { body: { name: "rules" } });
  expect(post).toHaveBeenNthCalledWith(2, "/accounts/a/rulesets", { body: { name: "rules" } });
  await handleRulesets(context("update", { "zone-id": "z", id: "r" }, { cf: { put } }));
  await handleRulesets(
    context("update", { "account-id": "a", id: "r" }, { cf: { put }, outputJson: false }),
  );
  expect(put).toHaveBeenNthCalledWith(1, "/zones/z/rulesets/r", { body: { name: "rules" } });
  expect(put).toHaveBeenNthCalledWith(2, "/accounts/a/rulesets/r", { body: { name: "rules" } });
});

test("validates inputs, dry runs writes, and rejects unknown actions", async () => {
  await expect(handleRulesets(context("list", {}))).rejects.toThrow(
    "Missing --zone-id or --account-id",
  );
  await expect(handleRulesets(context("get", { "zone-id": "z" }))).rejects.toThrow("Missing --id");
  await expect(
    handleRulesets(context("create", { "zone-id": "z" }, { body: null })),
  ).rejects.toThrow("Missing --data");
  await expect(
    handleRulesets(context("update", { "zone-id": "z", id: "r" }, { body: null })),
  ).rejects.toThrow("Missing --data");
  const printer = { log: jest.fn() };
  await handleRulesets(context("create", { "zone-id": "z", "dry-run": true }, { printer }));
  await handleRulesets(
    context("update", { "zone-id": "z", id: "r", "dry-run": true }, { printer }),
  );
  expect(printer.log).toHaveBeenCalledTimes(2);
  await expect(handleRulesets(context("other", { "zone-id": "z" }))).rejects.toThrow(
    "Unknown rulesets action: other",
  );
});

test("uses the default printer for text output", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  await handleRulesets(
    context("list", { "zone-id": "z" }, { outputJson: false, printer: undefined }),
  );
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});
