import process from "node:process";
import { interruptProcess } from "./interrupt-process.mjs";
import { readHiddenTerminalInput } from "./terminal-reader.mjs";
import { readHiddenStreamInput } from "./stream-reader.mjs";

export async function promptHidden(
  input = process.stdin,
  output = process.stderr,
  interrupt = interruptProcess.bind(null, process.kill.bind(process), process.pid),
) {
  output.write("Cloudflare API token (input hidden): ");
  if (!input.isTTY || typeof input.setRawMode !== "function")
    return readHiddenStreamInput(input, output);
  return readHiddenTerminalInput(input, output, interrupt);
}
