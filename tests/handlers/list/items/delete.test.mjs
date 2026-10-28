import { jest } from "@jest/globals";
import { deleteListItems } from "../../../../src/handlers/list/items/delete.mjs";

const base = (overrides = {}) => ({
  cf: { delete: jest.fn().mockResolvedValue({ ok: true }) },
  accountId: "acct",
  id: "list",
  body: { ids: ["a", "b"] },
  opts: { force: true },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("deletes items with SDK and generic clients", async () => {
  const generic = base();
  await deleteListItems(generic);
  expect(generic.cf.delete).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: { items: [{ id: "a" }, { id: "b" }] },
  });
  expect(generic.toJsonOutput).toHaveBeenCalledWith({ ok: true });
  const remove = jest.fn().mockResolvedValue({ ok: "deleted" });
  const sdk = base({ cf: { rules: { lists: { items: { delete: remove } } } }, outputJson: false });
  await deleteListItems(sdk);
  expect(remove).toHaveBeenCalledWith("list", {
    account_id: "acct",
    items: [{ id: "a" }, { id: "b" }],
  });
  expect(sdk.printer.log).toHaveBeenCalledWith('{\n  "ok": "deleted"\n}');
});

test("supports delete dry runs without a network request", async () => {
  const dryRun = base({ opts: { "dry-run": true } });
  await deleteListItems(dryRun);
  expect(dryRun.cf.delete).not.toHaveBeenCalled();
  expect(dryRun.printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
});

test("treats explicit false as a live deletion that requires force", async () => {
  const cf = { delete: jest.fn().mockResolvedValue({ ok: true }) };
  await expect(deleteListItems(base({ cf, opts: { "dry-run": false } }))).rejects.toThrow(
    "without --force",
  );
  await deleteListItems(base({ cf, opts: { force: true, "dry-run": false } }));
  expect(cf.delete).toHaveBeenCalledWith("/accounts/acct/rules/lists/list/items", {
    body: { items: [{ id: "a" }, { id: "b" }] },
  });
});

test("requires item IDs and force", async () => {
  await expect(deleteListItems(base({ body: {} }))).rejects.toThrow("Missing --data");
  await expect(deleteListItems(base({ body: { ids: [] } }))).rejects.toThrow(
    "Expected at least one item ID",
  );
  await expect(deleteListItems(base({ opts: {} }))).rejects.toThrow("without --force");
});

test("stops when item validation fails without throwing", async () => {
  const cf = { delete: jest.fn() };
  const fail = jest.fn();
  await deleteListItems(base({ cf, body: {}, fail }));
  expect(fail).toHaveBeenCalledWith('Missing --data or --file with {"ids":[...]}');
  expect(cf.delete).not.toHaveBeenCalled();

  await deleteListItems(base({ cf, body: { ids: [] }, fail }));
  await deleteListItems(base({ cf, opts: {}, fail }));
  expect(fail).toHaveBeenCalledWith("Expected at least one item ID");
  expect(fail).toHaveBeenCalledWith("Refusing to delete without --force");
  expect(cf.delete).not.toHaveBeenCalled();
});
