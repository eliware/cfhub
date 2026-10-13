import { jest } from "@jest/globals";
import { showUpdateNotice } from "../../src/cli/update-notice.mjs";

test("prints an update notice and ignores failed checks", async () => {
  const printer = { error: jest.fn() };
  const shared = {
    currentVersion: "1.0.0",
    homeDir: "/home",
    env: {},
    fsImpl: {},
    printer,
  };
  await showUpdateNotice({ ...shared, updateCheck: jest.fn().mockResolvedValue("2.0.0") });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("2.0.0"));
  await showUpdateNotice({ ...shared, updateCheck: jest.fn().mockRejectedValue(Error("offline")) });
  expect(printer.error).toHaveBeenCalledTimes(1);
});
