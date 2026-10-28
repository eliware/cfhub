import { extensionCleanupReport } from "../../../src/handlers/extension/cleanup-report.mjs";

test("returns cleanup errors with the backup path", () => {
  const errors = [{ path: "stage", error: new Error("cleanup failed") }];
  expect(extensionCleanupReport("backup", "backup/demo", errors)).toEqual({
    backupDestination: "backup/demo",
    backupRetained: false,
    cleanupErrors: errors,
  });
});

test("marks a backup as retained when its cleanup fails", () => {
  expect(
    extensionCleanupReport("backup", "backup/demo", [{ path: "backup", error: Error() }]),
  ).toEqual({
    backupDestination: "backup/demo",
    backupRetained: true,
    cleanupErrors: [{ path: "backup", error: expect.any(Error) }],
  });
});

test("returns no report when cleanup succeeds", () => {
  expect(extensionCleanupReport("backup", "backup/demo", [])).toBeUndefined();
});
