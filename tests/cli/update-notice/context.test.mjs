import { jest } from "@jest/globals";
import { scheduleUpdateNotice } from "../../../src/cli/update-notice/context.mjs";

const context = (overrides = {}) => ({
  outputJson: false,
  opts: {},
  settings: {},
  pager: false,
  terminal: { log: jest.fn() },
  printer: { log: jest.fn(), error: jest.fn() },
  updateCheck: jest.fn().mockResolvedValue("99.0.0"),
  homeDir: "/tmp/cfhub-update-notice",
  env: {},
  fsImpl: { existsSync: () => false },
  ...overrides,
});

test("shows an available update and contains update-check failures", async () => {
  const input = context();
  scheduleUpdateNotice(input);
  await Promise.resolve();
  await Promise.resolve();
  expect(input.printer.error).toHaveBeenCalledWith(expect.stringContaining("99.0.0"));

  const failed = context({ updateCheck: jest.fn().mockRejectedValue(new Error("offline")) });
  scheduleUpdateNotice(failed);
  await Promise.resolve();
  await Promise.resolve();
  expect(failed.printer.error).not.toHaveBeenCalled();
});

test("sends update notices to the pager when it owns readable output", async () => {
  const input = context({ pager: true });
  scheduleUpdateNotice(input);
  await Promise.resolve();
  await Promise.resolve();
  expect(input.terminal.log).toHaveBeenCalledWith(expect.stringContaining("99.0.0"));
  expect(input.printer.error).not.toHaveBeenCalled();
});

test("schedules update checks without waiting for the lookup", () => {
  const updateCheck = jest.fn().mockResolvedValue(null);
  const input = context({ updateCheck });
  expect(scheduleUpdateNotice(input)).toBeUndefined();
  expect(updateCheck).toHaveBeenCalledTimes(1);
});

test.each([
  ["JSON output", { outputJson: true }],
  ["quiet output", { opts: { quiet: true } }],
  ["disabled setting", { settings: { "update-check": false } }],
  ["string disabled setting", { settings: { "update-check": "false" } }],
])("does not schedule update notices for %s", (_name, overrides) => {
  const input = context(overrides);
  scheduleUpdateNotice(input);
  expect(input.updateCheck).not.toHaveBeenCalled();
});
