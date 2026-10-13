import { jest } from "@jest/globals";

export const profileOptions = (overrides = {}) => ({
  action: "list",
  resource: "oauth",
  opts: {},
  data: { active: null, profiles: {} },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: jest.fn(),
  write: jest.fn(),
  profileHome: "/tmp/profile-home",
  profileFs: {},
  readCredentialImpl: jest.fn().mockResolvedValue(null),
  revokeOAuthImpl: jest.fn(),
  deleteCredentialImpl: jest.fn(),
  ...overrides,
});
