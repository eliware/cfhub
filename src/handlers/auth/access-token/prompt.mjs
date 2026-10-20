import process from "node:process";
import { readHiddenTerminalInput } from "./terminal-reader.mjs";
import { readHiddenStreamInput } from "./stream-reader.mjs";

export async function promptHidden(input = process.stdin, output = process.stderr) {
  output.write("Cloudflare API token (input hidden): ");
  if (!input.isTTY || typeof input.setRawMode !== "function")
    return readHiddenStreamInput(input, output);
  return readHiddenTerminalInput(input, output);
}
