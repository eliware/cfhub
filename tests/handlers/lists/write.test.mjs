import { jest } from "@jest/globals";
import { handleListsWrite } from "../../../src/handlers/lists/write.mjs";

const base = (overrides = {}) => ({
  action: "create",
  cf: {
    post: jest.fn().mockResolvedValue({ id: "created" }),
    put: jest.fn().mockResolvedValue({ id: "updated" }),
  },
  accountId: "account-1",
  id: "list-1",
  body: { name: "block" },
  opts: {},
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("creates and updates lists", async () => {
  const create = base();
  await handleListsWrite(create);
  expect(create.cf.post).toHaveBeenCalledWith("/accounts/account-1/rules/lists", {
    body: create.body,
  });
  expect(create.toJsonOutput).toHaveBeenCalledWith({ id: "created" });

  const update = base({
    action: "update",
    opts: { "dry-run": false },
  });
  await handleListsWrite(update);
  expect(update.cf.put).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-1", {
    body: update.body,
  });
  expect(update.toJsonOutput).toHaveBeenCalledWith({ id: "updated" });
});

test("supports dry runs and text output", async () => {
  const create = base({ opts: { "dry-run": true } });
  await handleListsWrite(create);
  expect(create.cf.post).not.toHaveBeenCalled();
  expect(create.printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));

  const update = base({
    action: "update",
    opts: { "dry-run": true },
  });
  await handleListsWrite(update);
  expect(update.cf.put).not.toHaveBeenCalled();
  expect(update.printer.log).toHaveBeenCalledWith(expect.stringContaining('"id": "list-1"'));

  const text = base({ outputJson: false });
  await handleListsWrite(text);
  expect(text.printer.log).toHaveBeenCalledWith(JSON.stringify({ id: "created" }, null, 2));

  const updateText = base({ action: "update", outputJson: false });
  await handleListsWrite(updateText);
  expect(updateText.printer.log).toHaveBeenCalledWith(JSON.stringify({ id: "updated" }, null, 2));
});

test("validates list write inputs", async () => {
  await expect(handleListsWrite(base({ body: null }))).rejects.toThrow("Missing --data");
  await expect(handleListsWrite(base({ action: "update", id: undefined }))).rejects.toThrow(
    "Missing --id",
  );
  await expect(handleListsWrite(base({ action: "update", body: null }))).rejects.toThrow(
    "Missing --data",
  );
});
