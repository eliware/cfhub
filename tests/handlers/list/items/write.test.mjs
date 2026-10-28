import { jest } from "@jest/globals";
import { createListItems } from "../../../../src/handlers/list/items/write.mjs";

const base = (overrides = {}) => ({
  cf: { post: jest.fn().mockResolvedValue({ ok: true }) },
  accountId: "acct",
  id: "list",
  body: { ip: "192.0.2.1" },
  opts: {},
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("creates items with SDK and generic clients", async () => {
  const generic = base();
  await createListItems(generic);
  expect(generic.cf.post).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: [generic.body],
  });
  expect(generic.toJsonOutput).toHaveBeenCalledWith({ ok: true });
  const create = jest.fn().mockResolvedValue({ ok: "create" });
  const sdk = base({ cf: { rules: { lists: { items: { create } } } }, outputJson: false });
  await createListItems(sdk);
  expect(create).toHaveBeenCalledWith("list", { account_id: "acct", body: [sdk.body] });
  expect(sdk.printer.log).toHaveBeenCalledWith('{\n  "ok": "create"\n}');
});

test("normalizes arrays and prints a create dry run", async () => {
  const body = [{ ip: "192.0.2.2" }];
  const array = base({ body });
  await createListItems(array);
  expect(array.cf.post).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", { body });
  const dryRun = base({ opts: { "dry-run": true } });
  await createListItems(dryRun);
  expect(dryRun.cf.post).not.toHaveBeenCalled();
  expect(dryRun.printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
});

test("creates items when dry run is explicitly false", async () => {
  const create = base({ opts: { "dry-run": false } });
  await createListItems(create);
  expect(create.cf.post).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: [create.body],
  });
  expect(create.printer.log).not.toHaveBeenCalled();
});

test("requires create data", async () => {
  await expect(createListItems(base({ body: null }))).rejects.toThrow("Missing --data");
});
