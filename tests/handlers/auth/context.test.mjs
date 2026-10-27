import { jest } from "@jest/globals";

const defaultRead = jest.fn(() => ({ profiles: {} }));
const createAuthDependencies = jest.fn((overrides = {}) => ({
  read: defaultRead,
  write: jest.fn(),
  ...overrides,
}));
jest.unstable_mockModule("../../../src/handlers/auth/dependencies.mjs", () => ({
  createAuthDependencies,
}));
const { createAuthContext } = await import("../../../src/handlers/auth/context.mjs");

test("applies default authentication context and reads profile data", () => {
  const context = createAuthContext();
  expect(context.resource).toBe("oauth");
  expect(context.printer).toBe(console);
  expect(context.env).toBe(process.env);
  expect(context.fail).toEqual(expect.any(Function));
  expect(context.data).toEqual({ profiles: {} });
  expect(defaultRead).toHaveBeenCalledWith(undefined, undefined);
});

test("preserves injected authentication context and dependencies", () => {
  const data = { profiles: { default: {} } };
  const read = jest.fn(() => data);
  const context = createAuthContext({
    resource: "auth",
    action: "status",
    printer: {},
    env: {},
    fail: jest.fn(),
    read,
  });
  expect(context.resource).toBe("auth");
  expect(context.action).toBe("status");
  expect(context.data).toBe(data);
  expect(context.read).toBe(read);
});
