import { jest } from "@jest/globals";

export const authStatusContext = (overrides = {}) => ({
  action: "status",
  resource: "auth",
  opts: {},
  cf: { get: jest.fn().mockResolvedValue({ result: {} }) },
  data: { active: null, profiles: {} },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: jest.fn(),
  ...overrides,
});
