import { PassThrough } from "node:stream";
import { defaultPromptAccountId, promptLine } from "../../../src/handlers/auth/prompts.mjs";

test("line prompt trims input", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  const result = promptLine("Account: ", input, output);
  input.end(" account-1 \n");
  await expect(result).resolves.toBe("account-1");
});

test("account prompt uses the default process streams", async () => {
  const stdin = Object.getOwnPropertyDescriptor(process, "stdin");
  const stderr = Object.getOwnPropertyDescriptor(process, "stderr");
  const input = new PassThrough();
  const output = new PassThrough();
  Object.defineProperty(process, "stdin", { configurable: true, value: input });
  Object.defineProperty(process, "stderr", { configurable: true, value: output });
  try {
    const result = defaultPromptAccountId();
    input.end(" account-1 \n");
    await expect(result).resolves.toBe("account-1");
  } finally {
    Object.defineProperty(process, "stdin", stdin);
    Object.defineProperty(process, "stderr", stderr);
  }
});
