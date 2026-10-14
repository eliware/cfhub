import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { readHiddenTerminalInput } from "../../src/handlers/auth-token-terminal-reader.mjs";

function terminalInput() {
  const input = new EventEmitter();
  input.setRawMode = jest.fn();
  input.pause = jest.fn();
  input.resume = jest.fn();
  return input;
}

test("reads terminal input and removes the last character on delete", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const result = readHiddenTerminalInput(input, output);
  input.emit("data", "secret");
  input.emit("data", "\u007f");
  input.emit("data", "t");
  input.emit("data", "\r");
  await expect(result).resolves.toBe("secret");
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.pause).toHaveBeenCalledTimes(1);
  expect(output.write).toHaveBeenCalledWith("\n");
});

test("returns an empty value and resets terminal mode on interrupt", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const result = readHiddenTerminalInput(input, output);
  input.emit("data", "\u0003");
  await expect(result).resolves.toBe("");
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.pause).toHaveBeenCalledTimes(1);
});

test("preserves UTF-8 characters split across input chunks", async () => {
  const input = terminalInput();
  const output = { write: jest.fn() };
  const result = readHiddenTerminalInput(input, output);
  const bytes = Buffer.from("café\r");
  input.emit("data", bytes.subarray(0, 4));
  input.emit("data", bytes.subarray(4));
  await expect(result).resolves.toBe("café");
});
