export function mockNodeFs(jest, overrides = {}) {
  const fsImpl = {
    existsSync: jest.fn(() => false),
    readFileSync: jest.fn(() => "{}"),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    chmodSync: jest.fn(),
    renameSync: jest.fn(),
    readdirSync: jest.fn(() => []),
    ...overrides,
  };
  jest.unstable_mockModule("node:fs", () => fsImpl);
  return fsImpl;
}
