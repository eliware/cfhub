import { jest } from "@jest/globals";
import { showList } from "../../../src/handlers/lists/item-view.mjs";

const base = (overrides = {}) => ({
  cf: { get: jest.fn() },
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

test("gets a list through SDK and generic clients", async () => {
  const getSdk = jest.fn().mockResolvedValue({ id: "sdk-list" });
  const toJsonOutput = jest.fn();
  await showList(base({ cf: { rules: { lists: { get: getSdk } } }, toJsonOutput }));
  expect(getSdk).toHaveBeenCalledWith("list-1", { account_id: "account-1" });
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "sdk-list" });

  const getGeneric = jest.fn().mockResolvedValue({ id: "generic-list" });
  const log = jest.fn();
  await showList(base({ cf: { get: getGeneric }, outputJson: false, printer: { log } }));
  expect(getGeneric).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-1", undefined);
  expect(log).toHaveBeenCalledWith(JSON.stringify({ id: "generic-list" }, null, 2));
});

test("requires an ID to get a list", async () => {
  await expect(showList(base({ id: undefined }))).rejects.toThrow("Missing --id");
});
