import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { PassThrough, Writable } from "node:stream";
import {
  API_TOKEN_TUTORIAL,
  defaultPromptAccountId,
  promptHidden,
} from "../../src/handlers/auth-prompts.mjs";

const outputWriter = () => ({ write: jest.fn() });

function terminalInput() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.setRawMode = jest.fn();
  input.pause = jest.fn();
  input.resume = jest.fn();
  return input;
}

test("prompt helpers expose setup guidance", () => {
  expect(API_TOKEN_TUTORIAL).toContain("Account API Token");
  expect(defaultPromptAccountId).toEqual(expect.any(Function));
});

test("hidden prompt reads and trims non-terminal input", async () => {
  const input = new PassThrough();
  const output = outputWriter();
  input.end("  token-value  \n");
  await expect(promptHidden(input, output)).resolves.toBe("token-value");
  expect(output.write).toHaveBeenCalledWith("Cloudflare API token (input hidden): ");
  expect(output.write).toHaveBeenCalledWith("\n");
});

test("hidden prompt handles text, deletion, and enter on a terminal", async () => {
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
});

test("hidden prompt returns an empty value after terminal interrupt", async () => {
  const input = terminalInput();
  const result = promptHidden(input, outputWriter());
  input.emit("data", "\u0003");
  await expect(result).resolves.toBe("");
  expect(input.setRawMode).toHaveBeenLastCalledWith(false);
  expect(input.pause).toHaveBeenCalledTimes(1);
});

test("account prompt trims input from the default process streams", async () => {
  const stdin = Object.getOwnPropertyDescriptor(process, "stdin");
  const stderr = Object.getOwnPropertyDescriptor(process, "stderr");
  const input = new PassThrough();
  const output = new Writable({ write: (_chunk, _encoding, done) => done() });
  Object.defineProperty(process, "stdin", { configurable: true, value: input });
  Object.defineProperty(process, "stderr", { configurable: true, value: output });
  try {
    const hidden = promptHidden(undefined, undefined);
    input.end(" hidden-token \n");
    await expect(hidden).resolves.toBe("hidden-token");

    const accountInput = new PassThrough();
    Object.defineProperty(process, "stdin", { configurable: true, value: accountInput });
    const result = defaultPromptAccountId();
    accountInput.end(" account-1 \n");
    await expect(result).resolves.toBe("account-1");
  } finally {
    Object.defineProperty(process, "stdin", stdin);
    Object.defineProperty(process, "stderr", stderr);
  }
});
