import { jest } from "@jest/globals";
import { createOutputContext } from "../../src/cli/output-context.mjs";
test("output context is exported", () => {
  expect(createOutputContext).toEqual(expect.any(Function));
});

test("output context prints update notices and contains check failures", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const common = {
    opts: {},
    printer,
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: { existsSync: () => false },
  };
  createOutputContext({ ...common, updateCheck: jest.fn().mockResolvedValue("99.0.0") });
  await Promise.resolve();
  await Promise.resolve();
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("99.0.0"));

  printer.error.mockClear();
  createOutputContext({
    ...common,
    updateCheck: jest.fn().mockRejectedValue(new Error("offline")),
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(printer.error).not.toHaveBeenCalled();
});

test("quiet output context suppresses command log output", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const context = createOutputContext({
    opts: { quiet: true },
    printer,
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: { existsSync: () => false },
    updateCheck: jest.fn(),
  });
  context.commandPrinter.log("hidden");
  expect(printer.log).not.toHaveBeenCalled();
});

test("sends update notices through the configured pager", async () => {
  const terminalFactory = jest.fn(() => ({ log: jest.fn(), error: jest.fn(), flush: jest.fn() }));
  const updateCheck = jest.fn().mockResolvedValue("99.0.0");
  const context = createOutputContext({
    opts: { pager: "less" },
    printer: { log: jest.fn(), error: jest.fn() },
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: {
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ pager: "less" }),
    },
    updateCheck,
    terminalFactory,
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(terminalFactory.mock.calls[0][0].pager).toBe("less");
  expect(terminalFactory.mock.results[0].value.log).toHaveBeenCalledWith(
    expect.stringContaining("99.0.0"),
  );
  expect(context.terminal).toBe(terminalFactory.mock.results[0].value);
});

test("returns a terminal flush function when terminal output is disabled", async () => {
  const context = createOutputContext({
    opts: { web: true, "no-pager": true },
    printer: { log: jest.fn(), error: jest.fn() },
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: { existsSync: () => false },
    updateCheck: jest.fn(),
  });
  expect(context.handled).toBe(true);
  await expect(context.terminal.flush()).resolves.toBeUndefined();
});
