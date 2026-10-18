import { jest } from "@jest/globals";
import { readRulesets } from "../../../src/handlers/rulesets/read.mjs";

const input = (overrides = {}) => ({
  action: "list",
  cf: { rulesets: { list: jest.fn().mockResolvedValue({ list: true }) } },
  zoneId: "zone",
  accountId: "account",
  id: "ruleset",
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("lists rulesets through the SDK for zone and account targets", async () => {
  const zone = input();
  await readRulesets(zone);
  expect(zone.cf.rulesets.list).toHaveBeenCalledWith({ zone_id: "zone" });
  const account = input({ zoneId: undefined, outputJson: false });
  await readRulesets(account);
  expect(account.cf.rulesets.list).toHaveBeenCalledWith({ account_id: "account" });
  expect(account.printer.log).toHaveBeenCalledWith(JSON.stringify({ list: true }, null, 2));
});

test("gets rulesets through generic and SDK clients", async () => {
  const genericGet = jest.fn().mockResolvedValue({ get: "generic" });
  const generic = input({ action: "get", cf: { get: genericGet } });
  await readRulesets(generic);
  expect(genericGet).toHaveBeenCalledWith("/zones/zone/rulesets/ruleset", undefined);
  expect(generic.toJsonOutput).toHaveBeenCalledWith({ get: "generic" });

  const sdkGet = jest.fn().mockResolvedValue({ get: "sdk" });
  const sdk = input({ action: "get", zoneId: undefined, cf: { rulesets: { get: sdkGet } } });
  await readRulesets(sdk);
  expect(sdkGet).toHaveBeenCalledWith("ruleset", { account_id: "account" });
  expect(sdk.toJsonOutput).toHaveBeenCalledWith({ get: "sdk" });
});

test("lists through a generic account client and renders get text", async () => {
  const get = jest.fn().mockResolvedValue({ result: [] });
  const list = input({ zoneId: undefined, cf: { get }, outputJson: false });
  await readRulesets(list);
  expect(get).toHaveBeenCalledWith("/accounts/account/rulesets", undefined);
  const log = jest.fn();
  await readRulesets(
    input({
      action: "get",
      cf: { rulesets: { get: jest.fn().mockResolvedValue({ id: "r" }) } },
      outputJson: false,
      printer: { log },
    }),
  );
  expect(log).toHaveBeenCalledWith('{\n  "id": "r"\n}');
});

test("requires an ID for ruleset reads", async () => {
  await expect(readRulesets(input({ action: "get", id: undefined }))).rejects.toThrow(
    "Missing --id",
  );
});
