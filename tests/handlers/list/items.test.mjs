import { jest } from "@jest/globals";
import { handleListItems } from "../../../src/handlers/list/items.mjs";

const context = (action, overrides = {}) => ({
  cf: {},
  action,
  opts: { "account-id": "acct", id: "list" },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("lists generic and SDK responses", async () => {
  const items = [{ id: "a", value: "value" }, { id: "b", ip: "192.0.2.1" }, { id: "c" }];
  const toJsonOutput = jest.fn();
  const get = jest.fn().mockResolvedValue({ result: items });
  await handleListItems(context("list", { cf: { get }, toJsonOutput }));
  expect(get).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith(items);
  const raw = { items };
  const rawOutput = jest.fn();
  await handleListItems(
    context("list", { cf: { get: jest.fn().mockResolvedValue(raw) }, toJsonOutput: rawOutput }),
  );
  expect(rawOutput).toHaveBeenCalledWith(raw);
  async function* values() {
    yield* items;
  }
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  const list = jest.fn().mockReturnValue(values());
  await handleListItems(
    context("list", {
      cf: { rules: { lists: { items: { list } } } },
      outputJson: false,
      printer: undefined,
    }),
  );
  expect(list).toHaveBeenCalledWith("list", { account_id: "acct" });
  expect(log.mock.calls[0][0]).toContain("b   192.0.2.1");
  expect(log.mock.calls[0][0]).toContain('{"id":"c"}');
});

test("dispatches create and delete actions to their handlers", async () => {
  const post = jest.fn().mockResolvedValue({});
  await handleListItems(context("create", { cf: { post }, body: { ip: "192.0.2.1" } }));
  expect(post).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: [{ ip: "192.0.2.1" }],
  });
  const remove = jest.fn().mockResolvedValue({});
  await handleListItems(
    context("delete", {
      cf: { delete: remove },
      opts: { "account-id": "acct", id: "list", force: true },
      body: { ids: ["a"] },
    }),
  );
  expect(remove).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: { items: [{ id: "a" }] },
  });
});

test("requires account and list IDs and rejects unknown actions", async () => {
  await expect(handleListItems(context("list", { opts: {} }))).rejects.toThrow(
    "Missing --account-id",
  );
  await expect(
    handleListItems(context("list", { opts: { "account-id": "acct" } })),
  ).rejects.toThrow("Missing --id");
  await expect(handleListItems(context("other"))).rejects.toThrow(
    "Unknown list-items action: other",
  );
});
