import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { promptHidden } from "../../../../src/handlers/auth/access-token/prompt.mjs";

const outputWriter = () => ({ write: jest.fn() });

function terminalInput() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.setRawMode = jest.fn();
  input.pause = jest.fn();
  input.resume = jest.fn();
  return input;
}

test("hidden prompt reads and trims non-terminal input", async () => {
  const input = new PassThrough();
  const output = outputWriter();
  input.end("  token-value  \n");
  await expect(promptHidden(input, output)).resolves.toBe("token-value");
  expect(output.write).toHaveBeenCalledWith("Cloudflare API token (input hidden): ");
  expect(output.write).toHaveBeenCalledWith("\n");
});

test("hidden prompt handles text, deletion, enter, and interrupt", async () => {
  const input = terminalInput();
  const output = outputWriter();
  const result = promptHidden(input, output);
  input.emit("data", "secret");
  input.emit("data", "\u007f");
  input.emit("data", "t");
  input.emit("data", "\r");
  await expect(result).resolves.toBe("secret");
  expect(input.setRawMode.mock.calls).toEqual([[true], [false]]);
  expect(input.pause).toHaveBeenCalledTimes(1);

  const interrupted = terminalInput();
  const interruptedResult = promptHidden(interrupted, outputWriter());
  interrupted.emit("data", "\u0003");
  await expect(interruptedResult).resolves.toBe("");
  expect(interrupted.setRawMode).toHaveBeenLastCalledWith(false);
  expect(interrupted.pause).toHaveBeenCalledTimes(1);
});

test("hidden prompt uses the default process streams", async () => {
  const stdin = Object.getOwnPropertyDescriptor(process, "stdin");
  const stderr = Object.getOwnPropertyDescriptor(process, "stderr");
  const input = new PassThrough();
  const output = new PassThrough();
  Object.defineProperty(process, "stdin", { configurable: true, value: input });
  Object.defineProperty(process, "stderr", { configurable: true, value: output });
  try {
    const result = promptHidden();
    input.end(" hidden-token \n");
    await expect(result).resolves.toBe("hidden-token");
  } finally {
    Object.defineProperty(process, "stdin", stdin);
    Object.defineProperty(process, "stderr", stderr);
  }
});
