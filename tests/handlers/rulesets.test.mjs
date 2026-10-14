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

test("routes read and mutation actions to their focused handlers", async () => {
  const read = context("list", { "zone-id": "zone" });
  await handleRulesets(read);
  expect(read.cf.rulesets.list).toHaveBeenCalledWith({ zone_id: "zone" });
  expect(read.toJsonOutput).toHaveBeenCalledWith({ list: true });

  const mutate = context("create", { "account-id": "account" });
  await handleRulesets(mutate);
  expect(mutate.cf.rulesets.create).toHaveBeenCalledWith({ account_id: "account", name: "rules" });
  expect(mutate.toJsonOutput).toHaveBeenCalledWith({ create: true });
});

test("requires a target and rejects unknown actions", async () => {
  await expect(handleRulesets(context("list", {}))).rejects.toThrow(
    "Missing --zone-id or --account-id",
  );
  await expect(handleRulesets(context("other", { "zone-id": "zone" }))).rejects.toThrow(
    "Unknown rulesets action: other",
  );
});

test("uses the default printer for text output", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  await handleRulesets(
    context("list", { "zone-id": "zone" }, { outputJson: false, printer: undefined }),
  );
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});
