import {
  managesCredentials,
  missingApiPermissionMessage,
  missingScopeMessage,
} from "../../src/cli/authorization-rules.mjs";

test("classifies credential actions", () => {
  expect(managesCredentials("auth", "login")).toBe(true);
  expect(managesCredentials("oauth", "status")).toBe(false);
  expect(managesCredentials("zones", "list")).toBe(false);
});

test("formats missing scope and token permission messages", () => {
  expect(missingScopeMessage(["zone.read"])).toContain("missing scope:");
  expect(missingScopeMessage(["zone.read", "dns.read"])).toContain("missing scopes:");
  expect(missingApiPermissionMessage(["DNS Write"])).toContain("missing permission:");
  expect(missingApiPermissionMessage(["DNS Write", "Zone Read"])).toContain("missing permissions:");
  expect(missingApiPermissionMessage(["Cannot verify this API path and method"])).toContain(
    "cannot verify this API request",
  );
});
