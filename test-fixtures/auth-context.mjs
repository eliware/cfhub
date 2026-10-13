import { jest } from "@jest/globals";

export const authContext = () => ({
  cf: { get: jest.fn().mockResolvedValue({ result: { id: "user-1" } }) },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: jest.fn(),
  read: () => ({ active: null, profiles: {} }),
  inspectApiTokenImpl: jest.fn().mockResolvedValue({
    permissions: [],
    permissionsKnown: false,
    permissionSummary: { total: 0, read: 0, write: 0, other: 0 },
  }),
});
