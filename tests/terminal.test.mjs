import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { createTerminalOutput } from "../src/terminal.mjs";

const childProcess = (closeCode = 0, inputError) => {
  const child = new EventEmitter();
  child.stdin = new EventEmitter();
  child.stdin.end = (text) => {
    child.input = text;
    queueMicrotask(() => {
      if (inputError) child.stdin.emit("error", inputError);
      child.emit("close", closeCode);
    });
  };
  return child;
};

test("writes normal and error output and flushes empty pagers", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const output = createTerminalOutput({ printer });
  output.log("hello");
  output.error("problem");
  await output.flush();
  expect(printer.log).toHaveBeenCalledWith("hello");
  expect(printer.error).toHaveBeenCalledWith("problem");
  const spawnImpl = jest.fn();
  await createTerminalOutput({ pager: "less", spawnImpl }).flush();
  expect(spawnImpl).not.toHaveBeenCalled();
});

test("buffers pager text and resolves successful closes", async () => {
  const child = childProcess(0);
  const spawnImpl = jest.fn(() => child);
  const output = createTerminalOutput({ pager: "less", spawnImpl });
  output.log("one\ntwo");
  await output.flush();
  expect(spawnImpl).toHaveBeenCalledWith("less", [], { stdio: ["pipe", "inherit", "inherit"] });
  expect(child.input).toBe("one\ntwo\n");
  const closed = childProcess(null);
  const second = createTerminalOutput({ pager: "less", spawnImpl: () => closed });
  second.log("done");
  await expect(second.flush()).resolves.toBeUndefined();
});

test("rejects pager exit and spawn failures", async () => {
  const failed = createTerminalOutput({ pager: "less", spawnImpl: () => childProcess(2) });
  failed.log("data");
  await expect(failed.flush()).rejects.toThrow("Pager exited with status 2");
  const spawnFailure = new Error("spawn failed");
  const broken = createTerminalOutput({
    pager: "less",
    spawnImpl: () => {
      const child = childProcess();
      queueMicrotask(() => child.emit("error", spawnFailure));
      return child;
    },
  });
  broken.log("data");
  await expect(broken.flush()).rejects.toThrow("spawn failed");
});

test("ignores broken pager pipes and rejects other input errors", async () => {
  const brokenPipe = Object.assign(new Error("closed"), { code: "EPIPE" });
  const output = createTerminalOutput({
    pager: "less",
    spawnImpl: () => childProcess(0, brokenPipe),
  });
  output.log("data");
  await expect(output.flush()).resolves.toBeUndefined();
  const inputFailure = new Error("input failed");
  const failure = createTerminalOutput({
    pager: "less",
    spawnImpl: () => childProcess(0, inputFailure),
  });
  failure.log("data");
  await expect(failure.flush()).rejects.toThrow("input failed");
});

test("uses default options and keeps JSON output plain", async () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  const output = createTerminalOutput();
  output.log("plain");
  await output.flush();
  expect(log).toHaveBeenCalledWith("plain");
  log.mockRestore();
  const printer = { log: jest.fn(), error: jest.fn() };
  createTerminalOutput({ printer, json: true, color: true, width: 40 }).log({ ok: true });
  expect(printer.log).toHaveBeenCalledWith("[object Object]");
});
