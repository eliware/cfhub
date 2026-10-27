import { jest } from "@jest/globals";
import { showLists } from "../../../src/handlers/lists/list-view.mjs";

const base = (overrides = {}) => ({
  cf: { get: jest.fn().mockResolvedValue({ result: [{ id: "list-1", name: "block" }] }) },
  accountId: "account-1",
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  ...overrides,
});

test("lists generic results or uses the SDK iterator", async () => {
  const generic = base();
  await showLists(generic);
  expect(generic.cf.get).toHaveBeenCalledWith("/accounts/account-1/rules/lists", undefined);
  expect(generic.toJsonOutput).toHaveBeenCalledWith([{ id: "list-1", name: "block" }]);

  const list = jest.fn(async function* () {
    yield { id: "sdk", name: "allow" };
  });
  const sdkOutput = jest.fn();
  await showLists(base({ cf: { rules: { lists: { list } } }, toJsonOutput: sdkOutput }));
  expect(list).toHaveBeenCalledWith({ account_id: "account-1" });
  expect(sdkOutput).toHaveBeenCalledWith([{ id: "sdk", name: "allow" }]);
});

test("prints table output and accepts raw generic responses", async () => {
  const log = jest.fn();
  await showLists(base({ outputJson: false, printer: { log } }));
  expect(log).toHaveBeenCalledWith("ID      NAME\n--      ----\nlist-1  block");

  const raw = { unexpected: true };
  const toJsonOutput = jest.fn();
  await showLists(base({ cf: { get: jest.fn().mockResolvedValue(raw) }, toJsonOutput }));
  expect(toJsonOutput).toHaveBeenCalledWith(raw);
});
