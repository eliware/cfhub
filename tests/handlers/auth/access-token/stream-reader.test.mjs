import { jest } from "@jest/globals";
import { PassThrough } from "node:stream";
import { readHiddenStreamInput } from "../../../../src/handlers/auth/access-token/stream-reader.mjs";

test("reads and trims input from a non-terminal stream", async () => {
  const input = new PassThrough();
  const output = { write: jest.fn() };
  input.end("  token-value  \n");
  await expect(readHiddenStreamInput(input, output)).resolves.toBe("token-value");
  expect(output.write).toHaveBeenCalledWith("\n");
});

test("reads only the first line of piped token input", async () => {
  let trailingRead = false;
  const input = (async function* () {
    yield Buffer.from("token-value\n");
    trailingRead = true;
    yield Buffer.from("unrelated data");
  })();
  await expect(readHiddenStreamInput(input)).resolves.toBe("token-value");
  expect(trailingRead).toBe(false);
});

test("reads a string chunk when the stream ends without a newline", async () => {
  const input = (async function* () {
    yield "token-value";
  })();
  await expect(readHiddenStreamInput(input)).resolves.toBe("token-value");
});

test("rejects piped token input above its byte limit", async () => {
  const output = { write: jest.fn() };
  const input = (async function* () {
    yield Buffer.alloc(4097, 97);
  })();
  await expect(readHiddenStreamInput(input, output)).rejects.toThrow(
    "API token input exceeds 4096 bytes",
  );
  expect(output.write).toHaveBeenCalledWith("\n");
});
