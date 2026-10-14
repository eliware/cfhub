import { jest } from "@jest/globals";
import { canRun, skipUnavailable } from "./cli-live-capabilities.mjs";

test("gates commands by readiness and granted permissions", () => {
  expect(canRun("zones", "list", { ready: false })).toBe(false);
  expect(canRun("zones", "list", { ready: true, scopes: null })).toBe(true);
  expect(canRun("zones", "list", { ready: true, scopes: ["zone.read"] })).toBe(true);
  expect(canRun("zones", "list", { ready: true, scopes: ["zone.write"] })).toBe(false);
});

test("skips unavailable Cloudflare capabilities", () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  expect(skipUnavailable("list", { stdout: "not enabled", stderr: "" })).toBe(true);
  expect(skipUnavailable("list", { stdout: "", stderr: "ordinary failure" })).toBe(false);
  expect(warning).toHaveBeenCalledWith("Skipping list: Cloudflare capability is unavailable.");
  warning.mockRestore();
});
