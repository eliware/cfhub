import { jest } from "@jest/globals";
import { reportTokenLogin } from "../../../../src/handlers/auth/access-token/login-result.mjs";

test("reports discovered token permissions", () => {
  const printer = { log: jest.fn() };
  reportTokenLogin({
    name: "work",
    tokenInfo: {
      permissionsKnown: true,
      permissionSummary: { total: 2, read: 1, write: 1, other: 0 },
    },
    printer,
  });
  expect(printer.log).toHaveBeenCalledWith(
    "Saved and activated profile work\nPermissions discovered: 2 (Read: 1, Write/Edit: 1, Other: 0)",
  );
});

test("reports profile activation when permissions are unknown", () => {
  const printer = { log: jest.fn() };
  reportTokenLogin({
    name: "work",
    tokenInfo: { permissionsKnown: false, permissionSummary: {} },
    printer,
  });
  expect(printer.log).toHaveBeenCalledWith("Saved and activated profile work");
});
