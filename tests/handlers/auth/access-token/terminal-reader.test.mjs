import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { readHiddenTerminalInput } from "../../../../src/handlers/auth/access-token/terminal-reader.mjs";

function terminalInput() {
  const input = new EventEmitter();
  input.setRawMode = jest.fn();
  input.pause = jest.fn();
  input.resume = jest.fn();
  return input;
}

test("sets up and cleans up terminal mode after input", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const result = readHiddenTerminalInput(input, output);
  input.emit("data", "terminal input");
  input.emit("data", "\r");
  await expect(result).resolves.toBe("terminal input");
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.pause).toHaveBeenCalledTimes(1);
  expect(input.resume).toHaveBeenCalledTimes(1);
  expect(output.write).toHaveBeenCalledWith("\n");
});

test("sends an interrupt and resets terminal mode when the user presses Ctrl-C", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const interrupt = jest.fn();
  const result = readHiddenTerminalInput(input, output, interrupt);
  input.emit("data", "\u0003");
  await expect(result).rejects.toMatchObject({ code: "SIGINT" });
  expect(interrupt).toHaveBeenCalledTimes(1);
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.pause).toHaveBeenCalledTimes(1);
});

test("rejects oversized hidden input and resets terminal mode", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const result = readHiddenTerminalInput(input, output);
  input.emit("data", "a".repeat(4097));
  await expect(result).rejects.toThrow("API token input exceeds 4096 bytes");
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.listenerCount("data")).toBe(0);
});

test("removes the data listener after each prompt", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const first = readHiddenTerminalInput(input, output);
  input.emit("data", "first\r");
  await expect(first).resolves.toBe("first");
  expect(input.listenerCount("data")).toBe(0);
  const second = readHiddenTerminalInput(input, output);
  input.emit("data", "second\r");
  await expect(second).resolves.toBe("second");
  expect(input.listenerCount("data")).toBe(0);
});
