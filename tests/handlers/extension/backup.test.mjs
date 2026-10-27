import path from "node:path";
import { jest } from "@jest/globals";
import { createExtensionBackup } from "../../../src/handlers/extension/backup.mjs";

test("creates an extension backup root and destination", () => {
  const fsImpl = { mkdtempSync: jest.fn(() => "/root/.cfhub-extension-backup-123") };
  expect(createExtensionBackup("/root", "demo", fsImpl)).toEqual({
    backupRoot: "/root/.cfhub-extension-backup-123",
    backupDestination: path.join("/root/.cfhub-extension-backup-123", "demo"),
  });
  expect(fsImpl.mkdtempSync).toHaveBeenCalledWith(path.join("/root", ".cfhub-extension-backup-"));
});
