import { EventEmitter } from "node:events";
import { jest } from "@jest/globals";
import { runCliLifecycle } from "../src/cli-lifecycle.mjs";

function createProcess() {
  return Object.assign(new EventEmitter(), { exitCode: undefined, noDeprecation: false });
}

test("runs the CLI with process error handlers", async () => {
  const processImpl = createProcess();
  const consoleImpl = { error: jest.fn() };
  const run = jest.fn().mockResolvedValue(undefined);
  await runCliLifecycle(run, processImpl, consoleImpl);
  expect(processImpl.noDeprecation).toBe(true);
  expect(run).toHaveBeenCalled();
  processImpl.emit("uncaughtException", new Error("uncaught failure"));
  processImpl.emit("unhandledRejection", "rejected failure");
  expect(consoleImpl.error).toHaveBeenNthCalledWith(1, "uncaught failure");
  expect(consoleImpl.error).toHaveBeenNthCalledWith(2, "rejected failure");
  expect(processImpl.exitCode).toBe(1);
});

test("reports rejected CLI runs and clears error handlers on signals", async () => {
  const processImpl = createProcess();
  const consoleImpl = { error: jest.fn() };
  await runCliLifecycle(
    jest.fn().mockRejectedValue(new Error("CLI failed")),
    processImpl,
    consoleImpl,
  );
  expect(consoleImpl.error).toHaveBeenCalledWith("CLI failed");
  processImpl.exitCode = 1;
  processImpl.emit("SIGTERM");
  expect(processImpl.exitCode).toBe(0);
  expect(processImpl.listenerCount("uncaughtException")).toBe(0);
  expect(processImpl.listenerCount("unhandledRejection")).toBe(0);
});

test("uses the current process and console when callers omit them", async () => {
  const priorExitCode = process.exitCode;
  await runCliLifecycle(async () => {});
  expect(process.noDeprecation).toBe(true);
  process.emit("SIGINT");
  process.exitCode = priorExitCode;
});
