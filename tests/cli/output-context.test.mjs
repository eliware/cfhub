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
