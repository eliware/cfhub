import { jest } from "@jest/globals";
import { handleLists } from "../../src/handlers/lists.mjs";

function context(overrides = {}, fields = {}) {
  if (typeof overrides === "string") overrides = { action: overrides, ...fields };
  return {
    cf: {
      rules: {
        lists: {
          list: jest.fn(async function* () {
            yield { id: "list-1", name: "blocklist" };
          }),
          get: jest.fn().mockResolvedValue({ id: "list-1" }),
        },
      },
      post: jest.fn().mockResolvedValue({ id: "list-2" }),
      put: jest.fn().mockResolvedValue({ id: "list-2", name: "updated" }),
      delete: jest.fn().mockResolvedValue({ success: true }),
    },
    action: "list",
    opts: { "account-id": "account-1" },
    outputJson: true,
    printer: { log: jest.fn() },
    toJsonOutput: jest.fn(),
    fail: (message) => {
      throw new Error(message);
    },
    ...overrides,
  };
}

test("handleLists is exported", () => {
  expect(typeof handleLists).toBe("function");
});

test("lists list and get use the SDK and JSON output", async () => {
  const list = context();
  await handleLists(list);
  expect(list.toJsonOutput).toHaveBeenCalledWith([{ id: "list-1", name: "blocklist" }]);

  const get = context({ action: "get", opts: { "account-id": "account-1", id: "list-1" } });
  await handleLists(get);
  expect(get.cf.rules.lists.get).toHaveBeenCalledWith("list-1", { account_id: "account-1" });
  expect(get.toJsonOutput).toHaveBeenCalledWith({ id: "list-1" });
});

test("lists create and update support dry runs and writes", async () => {
  const createDry = context({
    action: "create",
    opts: { "account-id": "account-1", "dry-run": true },
    body: { name: "blocklist", kind: "ip" },
  });
  await handleLists(createDry);
  expect(createDry.cf.post).not.toHaveBeenCalled();
  expect(createDry.printer.log).toHaveBeenCalled();

  const create = context({ action: "create", body: { name: "blocklist", kind: "ip" } });
  await handleLists(create);
  expect(create.cf.post).toHaveBeenCalledWith("/accounts/account-1/rules/lists", {
    body: create.body,
  });

  const createText = context({ action: "create", outputJson: false, body: { name: "text" } });
  await handleLists(createText);
  expect(createText.printer.log).toHaveBeenCalledWith(JSON.stringify({ id: "list-2" }, null, 2));

  const updateDry = context({
    action: "update",
    opts: { "account-id": "account-1", id: "list-2", "dry-run": true },
    body: { name: "updated" },
  });
  await handleLists(updateDry);
  expect(updateDry.cf.put).not.toHaveBeenCalled();

  const update = context({
    action: "update",
    opts: { "account-id": "account-1", id: "list-2" },
    body: { name: "updated" },
  });
  await handleLists(update);
  expect(update.cf.put).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-2", {
    body: update.body,
  });

  const updateText = context({
    action: "update",
    outputJson: false,
    opts: { "account-id": "account-1", id: "list-2" },
    body: { name: "text" },
  });
  await handleLists(updateText);
  expect(updateText.printer.log).toHaveBeenCalledWith(
    JSON.stringify({ id: "list-2", name: "updated" }, null, 2),
  );
});

test("lists delete requires force and sends the request", async () => {
  const missingForce = context({
    action: "delete",
    opts: { "account-id": "account-1", id: "list-1" },
  });
  await expect(handleLists(missingForce)).rejects.toThrow("Refusing lists delete without --force");
  expect(missingForce.cf.delete).not.toHaveBeenCalled();

  const deletion = context({
    action: "delete",
    opts: { "account-id": "account-1", id: "list-1", force: true },
  });
  await handleLists(deletion);
  expect(deletion.cf.delete).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-1");
  expect(deletion.toJsonOutput).toHaveBeenCalledWith({ success: true });

  const deletionText = context({
    action: "delete",
    outputJson: false,
    opts: { "account-id": "account-1", id: "list-1", force: true },
  });
  await handleLists(deletionText);
  expect(deletionText.printer.log).toHaveBeenCalledWith(JSON.stringify({ success: true }, null, 2));
});

test("lists handles SDK response forms and text output", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  const lists = [{ id: "one", name: "allow" }];
  const cf = { get: jest.fn().mockResolvedValue({ result: lists }) };
  await handleLists(context({ cf, outputJson: false, printer: undefined }));
  expect(cf.get).toHaveBeenCalledWith("/accounts/account-1/rules/lists", undefined);
  expect(log).toHaveBeenCalledWith("ID   NAME\n--   ----\none  allow");
  const raw = { unexpected: true };
  const toJsonOutput = jest.fn();
  await handleLists(context({ cf: { get: jest.fn().mockResolvedValue(raw) }, toJsonOutput }));
  expect(toJsonOutput).toHaveBeenCalledWith(raw);
  log.mockRestore();
});

test("lists validates account, ID, body, and unknown action", async () => {
  await expect(handleLists(context({ opts: {} }))).rejects.toThrow("Missing --account-id");
  await expect(
    handleLists(context({ action: "get", opts: { "account-id": "a" } })),
  ).rejects.toThrow("Missing --id");
  await expect(handleLists(context({ action: "create", body: null }))).rejects.toThrow(
    "Missing --data",
  );
  await expect(
    handleLists(context({ action: "update", opts: { "account-id": "a" }, body: {} })),
  ).rejects.toThrow("Missing --id");
  await expect(
    handleLists(context({ action: "update", opts: { "account-id": "a", id: "x" }, body: null })),
  ).rejects.toThrow("Missing --data");
  await expect(handleLists(context({ action: "unknown" }))).rejects.toThrow(
    "Unknown lists action: unknown",
  );
});

test("gets lists through the SDK and prints text output", async () => {
  const get = jest.fn().mockResolvedValue({ id: "sdk-list" });
  const printer = { log: jest.fn() };
  await handleLists(
    context({
      action: "get",
      opts: { "account-id": "acct", id: "sdk-list" },
      cf: { get },
      outputJson: false,
      printer,
    }),
  );
  expect(get).toHaveBeenCalledWith("/accounts/acct/rules/lists/sdk-list", undefined);
  expect(printer.log).toHaveBeenCalledWith('{\n  "id": "sdk-list"\n}');
});
