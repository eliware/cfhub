import { jest } from "@jest/globals";
import { createOutputContext } from "../../src/cli/output-context.mjs";
test("output context is exported", () => {
  expect(createOutputContext).toEqual(expect.any(Function));
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

test("creates terminal output when saved settings select a pager", () => {
  const terminal = { log: jest.fn(), error: jest.fn(), flush: jest.fn() };
  const terminalFactory = jest.fn(() => terminal);
  const context = createOutputContext({
    opts: {},
    printer: { log: jest.fn(), error: jest.fn() },
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: {
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ pager: "less", "update-check": false }),
    },
    updateCheck: jest.fn(),
    terminalFactory,
  });
  expect(terminalFactory).toHaveBeenCalledWith(
    expect.objectContaining({ pager: "less", json: false }),
  );
  expect(context.terminal).toBe(terminal);
});

test("prints dashboard links and returns a terminal flush function", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const context = createOutputContext({
    opts: { web: true, "no-pager": true, "zone-id": "zone" },
    printer,
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: {
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ "update-check": false }),
    },
    updateCheck: jest.fn(),
  });
  expect(context.handled).toBe(true);
  expect(printer.log).toHaveBeenCalledWith("https://dash.cloudflare.com/zones/zone");
  await expect(context.terminal.flush()).resolves.toBeUndefined();
});
