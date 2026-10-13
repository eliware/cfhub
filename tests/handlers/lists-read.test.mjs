import { jest } from "@jest/globals";
import { handleListsRead } from "../../src/handlers/lists-read.mjs";

const base = (overrides = {}) => ({
  action: "list",
  cf: { get: jest.fn().mockResolvedValue({ result: [{ id: "list-1", name: "block" }] }) },
  accountId: "account-1",
  id: "list-1",
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("lists use generic results or the SDK iterator", async () => {
  const generic = base();
  await handleListsRead(generic);
  expect(generic.cf.get).toHaveBeenCalledWith("/accounts/account-1/rules/lists", undefined);
  expect(generic.toJsonOutput).toHaveBeenCalledWith([{ id: "list-1", name: "block" }]);

  const list = jest.fn(async function* () {
    yield { id: "sdk", name: "allow" };
  });
  const sdkOutput = jest.fn();
  await handleListsRead(base({ cf: { rules: { lists: { list } } }, toJsonOutput: sdkOutput }));
  expect(list).toHaveBeenCalledWith({ account_id: "account-1" });
  expect(sdkOutput).toHaveBeenCalledWith([{ id: "sdk", name: "allow" }]);
});

test("renders list text and accepts raw generic responses", async () => {
  const log = jest.fn();
  await handleListsRead(base({ outputJson: false, printer: { log } }));
  expect(log).toHaveBeenCalledWith("ID      NAME\n--      ----\nlist-1  block");

  const raw = { unexpected: true };
  const toJsonOutput = jest.fn();
  await handleListsRead(base({ cf: { get: jest.fn().mockResolvedValue(raw) }, toJsonOutput }));
  expect(toJsonOutput).toHaveBeenCalledWith(raw);
});

test("gets lists through SDK and generic clients with JSON and text output", async () => {
  const getSdk = jest.fn().mockResolvedValue({ id: "sdk-list" });
  const toJsonOutput = jest.fn();
  await handleListsRead(
    base({
      action: "get",
      cf: { rules: { lists: { get: getSdk } } },
      toJsonOutput,
    }),
  );
  expect(getSdk).toHaveBeenCalledWith("list-1", { account_id: "account-1" });
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "sdk-list" });

  const getGeneric = jest.fn().mockResolvedValue({ id: "generic-list" });
  const log = jest.fn();
  await handleListsRead(
    base({ action: "get", cf: { get: getGeneric }, outputJson: false, printer: { log } }),
  );
  expect(getGeneric).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-1", undefined);
  expect(log).toHaveBeenCalledWith(JSON.stringify({ id: "generic-list" }, null, 2));
});

test("requires an ID to get a list", async () => {
  await expect(handleListsRead(base({ action: "get", id: undefined }))).rejects.toThrow(
    "Missing --id",
  );
});
