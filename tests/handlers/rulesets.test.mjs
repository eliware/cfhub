import { jest } from "@jest/globals";
import { handleRulesets } from "../../src/handlers/rulesets.mjs";

test("handleRulesets is exported", () => {
  expect(typeof handleRulesets).toBe("function");
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
  test("handleRulesets list/get/create/update/unknown and validations", async () => {
    const cf = {
      rulesets: {
        list: jest.fn().mockResolvedValue([{ id: "r1" }]),
        get: jest.fn().mockResolvedValue({ id: "r1" }),
        create: jest.fn().mockResolvedValue({ created: true }),
        update: jest.fn().mockResolvedValue({ updated: true }),
      },
    };
    await handleRulesets({
      cf,
      action: "list",
      opts: { "zone-id": "z1" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "get",
      opts: { "account-id": "acct1", id: "r1" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "create",
      opts: { "account-id": "acct1" },
      body: { name: "x" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "update",
      opts: { "zone-id": "z1", id: "r1" },
      body: { name: "y" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await expect(
      handleRulesets({
        cf,
        action: "bogus",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Unknown rulesets action: bogus");
    expect(cf.rulesets.list).toHaveBeenCalledWith({ zone_id: "z1" });
    expect(cf.rulesets.get).toHaveBeenCalledWith("r1", { account_id: "acct1" });
    expect(cf.rulesets.create).toHaveBeenCalledWith({ account_id: "acct1", name: "x" });
    expect(cf.rulesets.update).toHaveBeenCalledWith("r1", { zone_id: "z1", name: "y" });
  });

  test("handleRulesets validates missing values and dry-run", async () => {
    const cf = {
      rulesets: { list: jest.fn(), get: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    await expect(
      handleRulesets({ cf, action: "list", opts: {}, outputJson: false, toJsonOutput, fail }),
    ).rejects.toThrow("Missing --zone-id or --account-id");
    await expect(
      handleRulesets({
        cf,
        action: "get",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --id");
    await expect(
      handleRulesets({
        cf,
        action: "create",
        opts: { "zone-id": "z1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --data or --file");
    await expect(
      handleRulesets({
        cf,
        action: "update",
        opts: { "zone-id": "z1", id: "r1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --data or --file");
    await handleRulesets({
      cf,
      action: "create",
      opts: { "zone-id": "z1", "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    expect(console.log).toHaveBeenCalled();
  });

  test("handleRulesets covers account scope and text/dry-run branches", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    const cf = {
      rulesets: {
        list: jest.fn().mockResolvedValue({ listed: true }),
        get: jest.fn().mockResolvedValue({ id: "r" }),
        create: jest.fn().mockResolvedValue({ created: true }),
        update: jest.fn().mockResolvedValue({ updated: true }),
      },
    };
    await handleRulesets({
      cf,
      action: "list",
      opts: { "account-id": "a" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "get",
      opts: { "account-id": "a", id: "r" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "create",
      opts: { "account-id": "a" },
      body: { name: "x" },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "create",
      opts: { "account-id": "a", "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "update",
      opts: { "account-id": "a", id: "r", "dry-run": true },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "update",
      opts: { "account-id": "a", id: "r" },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    expect(printer.log).toHaveBeenCalled();
    expect(toJsonOutput).toHaveBeenCalledWith({ created: true });
  });

  test("handleRulesets covers zone get text and real create", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    const cf = {
      rulesets: {
        get: jest.fn().mockResolvedValue({ id: "r" }),
        create: jest.fn().mockResolvedValue({ created: true }),
      },
    };
    await handleRulesets({
      cf,
      action: "get",
      opts: { "zone-id": "z", id: "r" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    await handleRulesets({
      cf,
      action: "create",
      opts: { "zone-id": "z" },
      body: { name: "x" },
      outputJson: false,
      printer,
      toJsonOutput,
      fail,
    });
    expect(printer.log).toHaveBeenCalled();
  });
});
