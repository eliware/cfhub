import { jest } from "@jest/globals";
import { dispatchCommand } from "../../src/cli/dispatch.mjs";

const context = (overrides = {}) => ({
  resource: "zones",
  action: "list",
  outputJson: true,
  common: {},
  terminal: { flush: jest.fn() },
  printer: { log: jest.fn(), error: jest.fn() },
  exit: jest.fn(),
  handlers: {},
  ...overrides,
});

test("dispatches a handler and flushes terminal output", async () => {
  const result = { zones: [] };
  const handler = jest.fn().mockResolvedValue(result);
  const terminal = { flush: jest.fn() };
  const call = context({ handlers: { zones: handler }, terminal });
  await expect(dispatchCommand(call)).resolves.toBe(result);
  expect(handler).toHaveBeenCalledWith(call.common);
  expect(terminal.flush).toHaveBeenCalled();
});

test("prints help and exits for unknown resources", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await dispatchCommand(context({ resource: "unknown", printer, exit }));
  expect(printer.log).toHaveBeenCalled();
  expect(exit).toHaveBeenCalledWith(1);
});

test("formats Cloudflare errors and exits", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await dispatchCommand(
    context({
      handlers: {
        zones: jest
          .fn()
          .mockRejectedValue({ status: 403, errors: [{ code: 9109, message: "denied" }] }),
      },
      printer,
      exit,
    }),
  );
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("Cloudflare denied"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("rethrows errors without a Cloudflare message", async () => {
  await expect(
    dispatchCommand(
      context({ handlers: { zones: jest.fn().mockRejectedValue(Error("unexpected")) } }),
    ),
  ).rejects.toThrow("unexpected");
});
