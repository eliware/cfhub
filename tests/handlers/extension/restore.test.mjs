import { jest } from "@jest/globals";
import { restorePreviousExtension } from "../../../src/handlers/extension/restore.mjs";

test("restores the previous extension from its backup path", () => {
  const fsImpl = { renameSync: jest.fn() };
  restorePreviousExtension({
    backupDestination: "backup/demo",
    destination: "installed/demo",
    fsImpl,
    installError: new Error("install failed"),
  });
  expect(fsImpl.renameSync).toHaveBeenCalledWith("backup/demo", "installed/demo");
});

test("reports the backup path and preserves the install error when restore fails", () => {
  const installError = new Error("install failed");
  const restoreError = new Error("restore failed");
  const fsImpl = {
    renameSync: jest.fn(() => {
      throw restoreError;
    }),
  };
  try {
    restorePreviousExtension({
      backupDestination: "backup/demo",
      destination: "installed/demo",
      fsImpl,
      installError,
    });
    throw new Error("Expected restore to fail");
  } catch (error) {
    expect(error.message).toContain("Restore the backup at backup/demo");
    expect(error.cause).toBe(installError);
  }
});
