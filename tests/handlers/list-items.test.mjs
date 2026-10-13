import { jest } from "@jest/globals";
import { handleListItems } from "../../src/handlers/list-items.mjs";

test("handleListItems is exported", () => {
  expect(typeof handleListItems).toBe("function");
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
  test("handleListItems list/create/delete/unknown and validations", async () => {
    async function* iterator() {
      yield { id: "i1" };
    }
    const cf = {
      rules: {
        lists: {
          items: {
            list: jest.fn().mockReturnValue(iterator()),
            create: jest.fn().mockResolvedValue({ ok: true }),
            delete: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
      },
    };
    await handleListItems({
      cf,
      action: "list",
      opts: { "account-id": "acct1", id: "list1" },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await handleListItems({
      cf,
      action: "create",
      opts: { "account-id": "acct1", id: "list1" },
      body: { ip: "1.2.3.4" },
      outputJson: true,
      toJsonOutput,
      fail,
    });
    await handleListItems({
      cf,
      action: "delete",
      opts: { "account-id": "acct1", id: "list1", force: true },
      body: { ids: ["a", "b"] },
      outputJson: false,
      toJsonOutput,
      fail,
    });
    await expect(
      handleListItems({
        cf,
        action: "bogus",
        opts: { "account-id": "acct1", id: "list1" },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Unknown list-items action: bogus");
    await expect(
      handleListItems({
        cf,
        action: "delete",
        opts: { "account-id": "acct1", id: "list1" },
        body: { ids: ["a"] },
        outputJson: false,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Refusing to delete without --force");
    expect(console.log).toHaveBeenCalledWith('ID  VALUE\n--  -----\ni1  {"id":"i1"}');
    expect(cf.rules.lists.items.create).toHaveBeenCalledWith("list1", {
      account_id: "acct1",
      body: [{ ip: "1.2.3.4" }],
    });
    expect(cf.rules.lists.items.delete).toHaveBeenCalledWith("list1", {
      account_id: "acct1",
      items: [{ id: "a" }, { id: "b" }],
    });
  });

  test("handleListItems covers JSON list/delete and invalid delete body", async () => {
    const printer = { log: jest.fn() };
    const toJsonOutput = jest.fn();
    const fail = jest.fn((msg) => {
      throw new Error(msg);
    });
    async function* iterator() {
      yield { id: "i2" };
    }
    const cf = {
      rules: {
        lists: {
          items: {
            list: jest.fn().mockReturnValue(iterator()),
            delete: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
      },
    };
    await handleListItems({
      cf,
      action: "list",
      opts: { "account-id": "a", id: "l" },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    await handleListItems({
      cf,
      action: "delete",
      opts: { "account-id": "a", id: "l", force: true },
      body: { ids: ["i2"] },
      outputJson: true,
      printer,
      toJsonOutput,
      fail,
    });
    await expect(
      handleListItems({
        cf,
        action: "delete",
        opts: { "account-id": "a", id: "l" },
        body: {},
        outputJson: false,
        printer,
        toJsonOutput,
        fail,
      }),
    ).rejects.toThrow("Missing --data");
    expect(toJsonOutput).toHaveBeenCalledTimes(2);
  });
});
