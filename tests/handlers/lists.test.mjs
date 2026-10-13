import { jest } from "@jest/globals";
import { handleLists } from "../../src/handlers/lists.mjs";

const context = (overrides = {}) => ({
  cf: {
    get: jest.fn().mockResolvedValue({ result: [] }),
    post: jest.fn().mockResolvedValue({ id: "new" }),
    put: jest.fn().mockResolvedValue({ id: "updated" }),
    delete: jest.fn().mockResolvedValue({ deleted: true }),
  },
  action: "list",
  opts: { "account-id": "account-1", id: "list-1", force: true },
  body: { name: "list" },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("routes list, get, write, and delete actions to focused handlers", async () => {
  const ctx = context();
  for (const action of ["list", "get", "create", "update", "delete"])
    await handleLists({ ...ctx, action });
  expect(ctx.cf.get).toHaveBeenCalledTimes(2);
  expect(ctx.cf.post).toHaveBeenCalledTimes(1);
  expect(ctx.cf.put).toHaveBeenCalledTimes(1);
  expect(ctx.cf.delete).toHaveBeenCalledTimes(1);
  expect(ctx.toJsonOutput).toHaveBeenCalledTimes(5);
});

test("validates the account ID and rejects unknown actions", async () => {
  await expect(handleLists(context({ opts: {} }))).rejects.toThrow("Missing --account-id");
  await expect(handleLists(context({ action: "unknown" }))).rejects.toThrow(
    "Unknown lists action: unknown",
  );
  await expect(
    handleLists({ action: "unknown", opts: {}, fail: () => {} }),
  ).resolves.toBeUndefined();
});
