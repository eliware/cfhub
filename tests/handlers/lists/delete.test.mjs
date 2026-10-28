import { jest } from "@jest/globals";
import { handleListsDelete } from "../../../src/handlers/lists/delete.mjs";

const base = (overrides = {}) => ({
  cf: { delete: jest.fn().mockResolvedValue({ success: true }) },
  accountId: "account-1",
  id: "list-1",
  opts: { force: true },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("deletes a list after force validation", async () => {
  const input = base();
  await handleListsDelete(input);
  expect(input.cf.delete).toHaveBeenCalledWith("/accounts/account-1/rules/lists/list-1");
  expect(input.toJsonOutput).toHaveBeenCalledWith({ success: true });
});

test("requires ID and force, then prints text output", async () => {
  await expect(handleListsDelete(base({ opts: {} }))).rejects.toThrow("without --force");
  await expect(handleListsDelete(base({ id: undefined }))).rejects.toThrow("Missing --id");

  const input = base({ outputJson: false });
  await handleListsDelete(input);
  expect(input.printer.log).toHaveBeenCalledWith(JSON.stringify({ success: true }, null, 2));
});

test("previews deletion without calling Cloudflare in dry-run mode", async () => {
  const input = base({ opts: { "dry-run": true } });
  await handleListsDelete(input);
  expect(input.cf.delete).not.toHaveBeenCalled();
  expect(input.printer.log).toHaveBeenCalledWith(
    JSON.stringify(
      { action: "delete", accountId: "account-1", id: "list-1", dryRun: true },
      null,
      2,
    ),
  );
});
