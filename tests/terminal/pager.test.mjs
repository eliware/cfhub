import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { flushTerminalPager } from "../../src/terminal/pager.mjs";

function childProcess(code = 0, inputError) {
  const child = new EventEmitter();
  child.stdin = new EventEmitter();
  child.stdin.end = jest.fn();
  queueMicrotask(() => {
    if (inputError) child.stdin.emit("error", inputError);
    child.emit("close", code);
  });
  return child;
}

test("flushes pager lines and handles empty output", async () => {
  const spawn = jest.fn(() => childProcess());
  await flushTerminalPager(["one", "two"], "less", spawn);
  expect(spawn).toHaveBeenCalledWith("less", [], { stdio: ["pipe", "inherit", "inherit"] });
  await expect(flushTerminalPager([], "less", spawn)).resolves.toBeUndefined();
  expect(spawn).toHaveBeenCalledTimes(1);
});

test("reports spawn, close, and stdin errors but ignores EPIPE", async () => {
  await expect(
    flushTerminalPager(["x"], "less", () => {
      throw Error("spawn");
    }),
  ).rejects.toThrow("spawn");
  await expect(flushTerminalPager(["x"], "less", () => childProcess(2))).rejects.toThrow(
    "status 2",
  );
  const broken = Object.assign(Error("broken"), { code: "EPIPE" });
  await expect(
    flushTerminalPager(["x"], "less", () => childProcess(0, broken)),
  ).resolves.toBeUndefined();
  await expect(
    flushTerminalPager(["x"], "less", () => childProcess(0, Error("input"))),
  ).rejects.toThrow("input");
});
