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
