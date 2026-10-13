import { jest } from "@jest/globals";

export function context(overrides = {}) {
  return {
    cf: {},
    action: "list",
    opts: {},
    outputJson: true,
    printer: { log: jest.fn() },
    toJsonOutput: jest.fn(),
    fail: jest.fn((message) => {
      throw new Error(message);
    }),
    ...overrides,
  };
}
