import { jest } from "@jest/globals";
import { mutateRulesets } from "../../../src/handlers/rulesets/mutate.mjs";

const input = (overrides = {}) => ({
  action: "create",
  opts: {},
  zoneId: "zone",
  accountId: "account",
  id: "ruleset",
  body: { name: "rules" },
  cf: {
    rulesets: {
      create: jest.fn().mockResolvedValue({ saved: "create" }),
      update: jest.fn().mockResolvedValue({ saved: "update" }),
    },
  },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("creates and updates through SDK clients for zone and account targets", async () => {
  const zoneCreate = input();
  await mutateRulesets(zoneCreate);
  expect(zoneCreate.cf.rulesets.create).toHaveBeenCalledWith({ zone_id: "zone", name: "rules" });
  const accountCreate = input({ zoneId: undefined });
  await mutateRulesets(accountCreate);
  expect(accountCreate.cf.rulesets.create).toHaveBeenCalledWith({
    account_id: "account",
    name: "rules",
  });

  const zoneUpdate = input({ action: "update", cf: { rulesets: { update: jest.fn() } } });
  await mutateRulesets(zoneUpdate);
  expect(zoneUpdate.cf.rulesets.update).toHaveBeenCalledWith("ruleset", {
    zone_id: "zone",
    name: "rules",
  });
  const accountUpdate = input({
    action: "update",
    zoneId: undefined,
    cf: { rulesets: { update: jest.fn() } },
  });
  await mutateRulesets(accountUpdate);
  expect(accountUpdate.cf.rulesets.update).toHaveBeenCalledWith("ruleset", {
    account_id: "account",
    name: "rules",
  });
});

test("creates and updates through generic clients", async () => {
  const post = jest.fn().mockResolvedValue({ saved: "create" });
  const put = jest.fn().mockResolvedValue({ saved: "update" });
  const create = input({ cf: { post }, outputJson: false });
  await mutateRulesets(create);
  expect(post).toHaveBeenCalledWith("/zones/zone/rulesets", { body: { name: "rules" } });
  expect(create.printer.log).toHaveBeenCalledWith(JSON.stringify({ saved: "create" }, null, 2));
  const update = input({ action: "update", cf: { put }, zoneId: undefined });
  await mutateRulesets(update);
  expect(put).toHaveBeenCalledWith("/accounts/account/rulesets/ruleset", {
    body: { name: "rules" },
  });
  expect(update.toJsonOutput).toHaveBeenCalledWith({ saved: "update" });
});

test("dry runs writes and requires mutation input", async () => {
  const printer = { log: jest.fn() };
  const create = input({ opts: { "dry-run": true }, printer });
  await mutateRulesets(create);
  expect(create.cf.rulesets.create).not.toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith(
    JSON.stringify(
      {
        zoneId: "zone",
        accountId: "account",
        id: "ruleset",
        action: "create",
        body: { name: "rules" },
        dryRun: true,
      },
      null,
      2,
    ),
  );
  await expect(mutateRulesets(input({ body: null }))).rejects.toThrow("Missing --data");
  await expect(mutateRulesets(input({ action: "update", id: undefined }))).rejects.toThrow(
    "Missing --id",
  );
  await expect(mutateRulesets(input({ action: "update", body: null }))).rejects.toThrow(
    "Missing --data",
  );
});
