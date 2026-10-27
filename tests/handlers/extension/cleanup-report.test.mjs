import { extensionCleanupReport } from "../../../src/handlers/extension/cleanup-report.mjs";

test("returns cleanup errors with the backup path", () => {
  const errors = [{ path: "stage", error: new Error("cleanup failed") }];
  expect(extensionCleanupReport("backup/demo", errors)).toEqual({
    backupDestination: "backup/demo",
    cleanupErrors: errors,
  });
});

test("returns no report when cleanup succeeds", () => {
  expect(extensionCleanupReport("backup/demo", [])).toBeUndefined();
});
