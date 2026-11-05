import { jest } from "@jest/globals";
import { readListItems } from "../../../../src/handlers/list/items/read.mjs";

test("follows cursor pages with the requested page size", async () => {
  const get = jest
    .fn()
    .mockResolvedValueOnce({
      result: [{ id: "one" }],
      result_info: { cursors: { after: "cursor one" } },
    })
    .mockResolvedValueOnce({ result: [{ id: "two" }], result_info: { cursors: {} } });
  const items = await readListItems({
    cf: { get },
    accountId: "account",
    listId: "list",
    opts: { paginate: true, "per-page": "250" },
    fail: (message) => {
      throw new Error(message);
    },
  });
  expect(get.mock.calls).toEqual([
    ["/accounts/account/rules/lists/list/items?per_page=250", undefined],
    ["/accounts/account/rules/lists/list/items?per_page=250&cursor=cursor+one", undefined],
  ]);
  expect(items).toEqual([{ id: "one" }, { id: "two" }]);
});

test("uses the default page size for pagination and keeps single-page reads unchanged", async () => {
  const get = jest
    .fn()
    .mockResolvedValueOnce({ result: [], result_info: { cursors: {} } })
    .mockResolvedValueOnce({ result: [] });
  const common = {
    cf: { get },
    accountId: "account",
    listId: "list",
    fail: (message) => {
      throw new Error(message);
    },
  };
  await readListItems({ ...common, opts: { paginate: true } });
  await readListItems({ ...common, opts: {} });
  expect(get.mock.calls).toEqual([
    ["/accounts/account/rules/lists/list/items?per_page=100", undefined],
    ["/accounts/account/rules/lists/list/items", undefined],
  ]);
});

test("passes page size to the SDK iterator", async () => {
  async function* pages() {
    yield { id: "one" };
    yield { id: "two" };
  }
  const list = jest.fn(() => pages());
  const items = await readListItems({
    cf: { rules: { lists: { items: { list } } } },
    accountId: "account",
    listId: "list",
    opts: { "per-page": "50" },
    fail: (message) => {
      throw new Error(message);
    },
  });
  expect(list).toHaveBeenCalledWith("list", { account_id: "account", per_page: 50 });
  expect(items).toEqual([{ id: "one" }, { id: "two" }]);
});

test.each(["0", "501", "1.5", "many"])("rejects invalid page size %s", async (pageSize) => {
  await expect(
    readListItems({
      cf: { get: jest.fn() },
      accountId: "account",
      listId: "list",
      opts: { "per-page": pageSize },
      fail: (message) => {
        throw new Error(message);
      },
    }),
  ).rejects.toThrow("--per-page must be an integer from 1 to 500");
});

test("stops after invalid page size when the error handler returns", async () => {
  const fail = jest.fn();
  const get = jest.fn();
  await expect(
    readListItems({
      cf: { get },
      accountId: "account",
      listId: "list",
      opts: { "per-page": "501" },
      fail,
    }),
  ).resolves.toEqual([]);
  expect(fail).toHaveBeenCalledWith("--per-page must be an integer from 1 to 500");
  expect(get).not.toHaveBeenCalled();
});

test("returns empty and raw responses from the API client", async () => {
  const get = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ message: "raw" });
  const options = {
    cf: { get },
    accountId: "account",
    listId: "list",
    opts: {},
    fail: jest.fn(),
  };
  await expect(readListItems(options)).resolves.toEqual([]);
  await expect(readListItems(options)).resolves.toEqual({ message: "raw" });
});

test("stops when the API repeats a pagination cursor", async () => {
  const get = jest.fn().mockResolvedValue({
    result: [],
    result_info: { cursors: { after: "same" } },
  });
  const fail = jest.fn();
  await expect(
    readListItems({
      cf: { get },
      accountId: "account",
      listId: "list",
      opts: { paginate: true },
      fail,
    }),
  ).resolves.toEqual([]);
  expect(get).toHaveBeenCalledTimes(2);
  expect(fail).toHaveBeenCalledWith("Cloudflare returned a repeated list-items pagination cursor");
});
